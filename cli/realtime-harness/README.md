# Realtime Harness

A thin CLI harness that spins up a Dexter realtime session, feeds scripted prompts, and captures
MCP tool traffic for assertions. The first scenario reproduces the "list managed wallets" flow the
team used manually, so we can regression-test the MCP proxy without opening the browser.

## What it does

- Requests an ephemeral realtime session (`/api/realtime/sessions`) using your existing session
  cookie or bearer token.
- Connects to the OpenAI Realtime API over websockets via `@openai/agents-realtime`.
- Sends scripted user prompts, waits for the agent to complete the turn, and records:
  - Which MCP tools were invoked (name + arguments + result payloads)
  - The assistant text that came back to the client
  - Any transport errors surfaced by the SDK
- Emits a JSON report to stdout and exits non‑zero if required tools are missing.

## Setup

```
npm install
```

Provide the harness with credentials via env vars (all optional, but you must supply either a
cookie or an Authorization header):

| Env var | Purpose |
|---------|---------|
| `HARNESS_FRONTEND_ORIGIN` | Base URL for the Next.js frontend (`https://beta.dexter.tools` or `http://localhost:3210`). Defaults to `http://localhost:3210`. |
| `HARNESS_SESSION_PATH` | Relative path for the realtime session endpoint. Defaults to `/api/realtime/sessions`. |
| `HARNESS_COOKIE` | Cookie header to forward when calling the session endpoint (e.g. Supabase session). |
| `HARNESS_AUTHORIZATION` | Authorization header (e.g. `Bearer ...`) to forward to the session endpoint. |
| `HARNESS_MODEL` | Override the realtime model id (falls back to server response or `gpt-realtime`). |
| `HARNESS_TIMEOUT_MS` | How long to wait for each scripted turn before failing. Defaults to `20000`. |

Tip: when running locally against the PM2 deployment, you can grab the cookie from the browser's
application tab and export it before running the harness.

## Usage

```
node ./cli/realtime-harness/run.mjs
```

To save results as JSON:

```
node ./cli/realtime-harness/run.mjs > /tmp/realtime-report.json
```

The script exits 0 on success and >0 if the session or assertions fail. The initial scenario asserts
that the `wallets.list` MCP tool completed and that the assistant produced text.

## Extending

Scripted "flights" live in `scenarioScripts`. A scenario describes:

- The prompt text to send
- Which MCP tool(s) are required
- Optional validation callbacks for assistant text or tool payloads

Add more scenarios to cover new tools, or split into suites (e.g. free vs. paywalled flows). The
`runScenario` helper already serialises turns, so you can queue multiple prompts per run.

Future enhancements that will be straightforward now that the plumbing is in place:

1. Persist full transport event logs to disk for diffing between runs.
2. Allow parallel execution with isolated sessions per scenario.
3. Add CLI flags (`--scenario wallets`) using a minimal argument parser.
4. Surface MCP latency / token usage metrics in the report.
