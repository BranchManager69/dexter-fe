# Customer Service Retail Realtime Example

This repository now vendors the official OpenAI **Customer Service Retail** scenario from the `openai-realtime-agents` demo so we can iterate from a known-good starting point.

## Source snapshot
- Location: `examples/openai-realtime-agents`
- Upstream repo: https://github.com/openai/openai-realtime-agents
- Commit: `137f89ea3651c87804d2c42527c8787377ab7dc6` (captured on clone)
- Scenario files of interest: `src/app/agentConfigs/customerServiceRetail/`

## How to run the example locally
1. `cd examples/openai-realtime-agents`
2. Install deps: `npm install`
3. Provide credentials: copy `.env.sample` to `.env` (or export) and set `OPENAI_API_KEY=...`
4. Launch: `npm run dev`
5. Open http://localhost:3000 and pick **Customer Service Retail** from the Scenario dropdown in the top-right to load the multi-agent flow.

The demo app is an isolated Next.js project, so it will not interfere with the main `dexter-fe` build.

## Swapping to the newest realtime voice model
Each specialist agent declares its `model` in `src/app/agentConfigs/customerServiceRetail/*.ts` (authentication, returns, sales, simulatedHuman). Update those strings to the realtime model you want to evaluate (e.g. `gpt-4o-realtime-preview-2024-12-17`). No other code changes are required before you validate audio quality differences.

## Hooking in MCP or custom tools (Phase 2 notes)
- The existing tool stubs live in `src/app/api/tools/` and are wired via the agent configs' `tools` arrays.
- Replace or augment entries such as `checkEligibilityAndPossiblyInitiateReturn` with calls into your MCP server or bespoke APIs.
- When you introduce MCP, reuse the transfer pattern that already exists: keep the realtime agent focused on the conversation, and forward heavy reasoning/tool work to MCP-backed functions or a supervisor model as needed.

Reach out when you're ready to start the model upgrade or MCP integration and we can pair up on the edits.
