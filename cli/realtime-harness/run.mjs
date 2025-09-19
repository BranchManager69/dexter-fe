#!/usr/bin/env node

import process from 'node:process';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { RealtimeSession, RealtimeAgent, OpenAIRealtimeWebSocket } from '@openai/agents-realtime';

const FRONTEND_ORIGIN = process.env.HARNESS_FRONTEND_ORIGIN || 'http://localhost:3210';
const SESSION_PATH = process.env.HARNESS_SESSION_PATH || '/api/realtime/sessions';
const COOKIE = process.env.HARNESS_COOKIE || '';
const AUTH_HEADER = process.env.HARNESS_AUTHORIZATION || '';
const MODEL_OVERRIDE = process.env.HARNESS_MODEL || '';
const TURN_TIMEOUT_MS = Number(process.env.HARNESS_TIMEOUT_MS || 20000);

const SESSION_URL = resolveUrl(SESSION_PATH, FRONTEND_ORIGIN);

const scenarios = [
  {
    name: 'wallets.list',
    prompt: 'List my managed wallets.',
    requiredTools: ['wallets.list'],
    assistantCheck: (text) => text && text.length > 0,
  },
];

function resolveUrl(path, origin) {
  try {
    return new URL(path, origin).toString();
  } catch (err) {
    throw new Error(`Unable to resolve session URL from origin=${origin} path=${path}: ${err?.message ?? err}`);
  }
}

async function requestEphemeralSession() {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (COOKIE) headers.set('cookie', COOKIE);
  if (AUTH_HEADER) headers.set('authorization', AUTH_HEADER);

  const payload = {};
  if (MODEL_OVERRIDE) payload.model = MODEL_OVERRIDE;

  const response = await fetch(SESSION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    redirect: 'manual',
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Ephemeral session request failed (${response.status}): ${text}`);
  }

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Unable to parse session response as JSON: ${err?.message ?? err}\nBody: ${text}`);
  }

  const clientSecret = data?.client_secret?.value || data?.client_secret || data?.apiKey;
  if (!clientSecret) {
    throw new Error(`Session response missing client secret. Body=${text}`);
  }

  return {
    clientSecret,
    model: MODEL_OVERRIDE || data?.model || 'gpt-realtime',
    raw: data,
  };
}

function createSession(clientSecret, model) {
  const agent = new RealtimeAgent({
    name: 'Dexter Harness',
    instructions: 'Act as the Dexter customer agent. Respond politely and concisely.',
  });

  const transport = new OpenAIRealtimeWebSocket();

  const session = new RealtimeSession(agent, {
    transport,
    model,
    automaticallyTriggerResponseForMcpToolCalls: true,
  });

  const connectOptions = {
    apiKey: () => clientSecret,
    model,
  };

  return { session, connectOptions };
}

function parseMaybeJson(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function extractMessageText(content) {
  if (!Array.isArray(content)) return '';
  const lines = [];
  for (const chunk of content) {
    if (!chunk || typeof chunk !== 'object') continue;
    if (typeof chunk.text === 'string') {
      lines.push(chunk.text);
      continue;
    }
    if (typeof chunk.transcript === 'string') {
      lines.push(chunk.transcript);
      continue;
    }
    if (typeof chunk.value === 'string') {
      lines.push(chunk.value);
      continue;
    }
  }
  return lines.join('\n').trim();
}

async function waitForAssistantTurn(session, timeoutMs) {
  const assistantItems = new Map();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for assistant response after ${timeoutMs}ms`));
    }, timeoutMs);

    const onHistoryAdded = (item) => {
      if (!item || item.type !== 'message' || item.role !== 'assistant') return;
      const existing = assistantItems.get(item.itemId) || {};
      const text = extractMessageText(item.content);
      assistantItems.set(item.itemId, {
        status: item.status,
        text: text || existing.text || '',
      });
      maybeResolve(item.itemId);
    };

    const onHistoryUpdated = (items) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        if (!item || item.type !== 'message' || item.role !== 'assistant') continue;
        const existing = assistantItems.get(item.itemId) || {};
        const text = extractMessageText(item.content);
        assistantItems.set(item.itemId, {
          status: item.status,
          text: text || existing.text || '',
        });
        maybeResolve(item.itemId);
      }
    };

    const onError = (err) => {
      cleanup();
      reject(new Error(`Realtime session error: ${err?.error?.message || err?.error || err}`));
    };

    function maybeResolve(itemId) {
      const entry = assistantItems.get(itemId);
      if (!entry) return;
      const { status, text } = entry;
      if ((status === 'completed' || status === 'incomplete') && text && text.trim()) {
        cleanup();
        resolve({ itemId, text: text.trim(), status });
      }
    }

    function cleanup() {
      clearTimeout(timer);
      session.off('history_added', onHistoryAdded);
      session.off('history_updated', onHistoryUpdated);
      session.off('error', onError);
    }

    session.on('history_added', onHistoryAdded);
    session.on('history_updated', onHistoryUpdated);
    session.on('error', onError);
  });
}

async function runScenario(session, scenario, options) {
  const { timeoutMs } = options;
  const toolCompletions = [];
  const errors = [];
  const transportEvents = [];

  const onMcpToolCompleted = (_ctx, _agent, toolCall) => {
    toolCompletions.push({
      id: toolCall.itemId || randomUUID(),
      name: toolCall.name,
      status: toolCall.status,
      arguments: parseMaybeJson(toolCall.arguments),
      output: parseMaybeJson(toolCall.output),
    });
  };

  const onTransportEvent = (event) => {
    if (!event) return;
    const lean = { type: event.type };
    if (event.type === 'response.completed') {
      lean.responseId = event.response?.id;
    }
    if (event.type?.startsWith('error')) {
      lean.details = event;
    }
    transportEvents.push(lean);
  };

  const onError = (err) => {
    errors.push(err);
  };

  session.on('mcp_tool_call_completed', onMcpToolCompleted);
  session.on('transport_event', onTransportEvent);
  session.on('error', onError);

  try {
    const assistantPromise = waitForAssistantTurn(session, timeoutMs);
    session.sendMessage(scenario.prompt);
    const assistant = await assistantPromise;

    const missingTools = (scenario.requiredTools || []).filter(
      (tool) => !toolCompletions.some((evt) => evt.name === tool),
    );

    if (missingTools.length) {
      const err = new Error(`Missing expected tool completions: ${missingTools.join(', ')}`);
      err.missingTools = missingTools;
      throw err;
    }

    if (scenario.assistantCheck && !scenario.assistantCheck(assistant.text)) {
      const err = new Error(`Assistant response failed custom check for scenario ${scenario.name}`);
      err.assistantText = assistant.text;
      throw err;
    }

    return {
      ok: true,
      assistant,
      toolCompletions,
      transportEvents,
      errors,
    };
  } finally {
    session.off('mcp_tool_call_completed', onMcpToolCompleted);
    session.off('transport_event', onTransportEvent);
    session.off('error', onError);
  }
}

async function main() {
  const timeline = [];
  try {
    const sessionInfo = await requestEphemeralSession();
    const { session, connectOptions } = createSession(sessionInfo.clientSecret, sessionInfo.model);
    await session.connect(connectOptions);

    for (const scenario of scenarios) {
      const startedAt = Date.now();
      try {
        const result = await runScenario(session, scenario, { timeoutMs: TURN_TIMEOUT_MS });
        timeline.push({
          scenario: scenario.name,
          durationMs: Date.now() - startedAt,
          ...result,
        });
      } catch (scenarioErr) {
        timeline.push({
          scenario: scenario.name,
          durationMs: Date.now() - startedAt,
          ok: false,
          error: formatError(scenarioErr),
        });
        throw scenarioErr;
      }
    }

    session.close();

    const report = {
      ok: true,
      frontendOrigin: FRONTEND_ORIGIN,
      model: sessionInfo.model,
      scenarios: timeline,
    };

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(0);
  } catch (err) {
    const report = {
      ok: false,
      error: formatError(err),
      scenarios: timeline,
    };
    process.stderr.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(1);
  }
}

function formatError(err) {
  if (!err) return { message: 'Unknown error' };
  const base = {
    message: err.message || String(err),
    name: err.name || undefined,
  };
  if (err.missingTools) base.missingTools = err.missingTools;
  if (err.assistantText) base.assistantText = err.assistantText;
  if (err.stack) base.stack = err.stack;
  return base;
}

await main();
