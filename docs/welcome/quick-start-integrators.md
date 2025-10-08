# Quick Start (Integrators)

This guide covers the fastest path for engineers who want to stand up a Dexter environment, wire in the API + MCP stack, and publish custom tools or surfaces. You should be comfortable with Node.js, PM2, and Supabase basics before starting.

---

## 1. Clone the core repositories

```bash
mkdir -p ~/dexter && cd ~/dexter
git clone https://github.com/BranchManager69/dexter-fe.git
git clone https://github.com/BranchManager69/dexter-api.git
git clone https://github.com/BranchManager69/dexter-mcp.git
git clone https://github.com/BranchManager69/dexter-agents.git
```

> Keep them as siblings so shared scripts (like the harness) can resolve relative paths.

---

## 2. Install dependencies & bootstrap environments

```bash
cd dexter-api && npm ci && cp .env.example .env
cd ../dexter-mcp && npm ci && cp .env.example .env
cd ../dexter-fe && npm ci && cp .env.example .env.local
```

Populate the env files with the following minimum values:

| File | Keys |
|------|------|
| `dexter-api/.env` | `OPENAI_API_KEY`, `OPENAI_REALTIME_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_AI_MCP_TOKEN`, `MCP_JWT_SECRET` |
| `dexter-mcp/.env` | `DEXTER_API_BASE_URL`, `TOKEN_AI_MCP_TOKEN`, `TOKEN_AI_MCP_TOOLSETS=wallet,solana,general` |
| `dexter-fe/.env.local` | `NEXT_PUBLIC_API_ORIGIN=http://localhost:3030`, `NEXT_PUBLIC_ENABLE_VOICE=false` (enable later), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (optional for dev) |

Supabase: either connect to the shared project (ask an admin for credentials) or run a local Supabase instance via `supabase start`.

---

## 3. Start the services

In separate terminals:

```bash
# API (port 3030)
cd dexter-api
npm run dev

# MCP server (port 3930)
cd dexter-mcp
npm run dev

# Frontend (port 3017)
cd dexter-fe
npm run dev
```

Visit `http://localhost:3017` and confirm you can sign in (guest mode works if Supabase is not connected).

---

## 4. Register a custom MCP tool

1. Create a new tool file under `dexter-mcp/toolsets/custom/index.mjs`:

```js
export function registerCustomToolset(server) {
  server.registerTool(
    'custom_echo',
    {
      title: 'Echo Message',
      description: 'Returns the message you send—useful for smoke tests.',
      _meta: { category: 'diagnostics', access: 'internal' },
      inputSchema: { message: z.string() },
    },
    async ({ message }) => ({
      content: [{ type: 'text', text: message }],
    })
  );
}
```

2. Register the toolset in `dexter-mcp/toolsets/index.mjs`:

```js
import { registerCustomToolset } from './custom/index.mjs';
// ...
registerCustomToolset(server);
```

3. Restart the MCP server and hit `http://localhost:3930/mcp/tools?tools=custom`. You should see the `custom_echo` definition.

4. Expose the tool to Dexter FE by adding `TOKEN_AI_MCP_TOOLSETS=wallet,solana,general,custom` to `dexter-mcp/.env`.

---

## 5. Call the tool through the API

Dexter FE never talks to MCP directly; everything routes through `dexter-api`. Use the helper endpoint to test your tool:

```bash
curl -X POST http://localhost:3030/mcp/invoke \
  -H 'Authorization: Bearer dev-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "tool": "custom_echo",
    "arguments": { "message": "Hello from Dexter" }
  }'
```

You should get back the same message plus a `receipt_id`. This proves tool invocation works end-to-end.

---

## 6. Wire the tool into a surface

### In Dexter FE

1. Create a helper in `app/lib/tools/custom.ts` to call the API route.  
2. Add a button or chat command that invokes the helper.  
3. Display the response in the UI (for chat, stream it into a message bubble).

### In Dexter Voice / Agents

1. Update the prompt profile in `dexter-agents/src/app/config/tools.ts` with the new tool.  
2. Add instructions telling the agent when to use `custom_echo`.  
3. Run `npm run dev` in `dexter-agents`, open `/`, and test the scenario.

---

## 7. Automate with the harness

Use the realtime harness to keep regressions out:

```bash
cd dexter-fe
npm run harness -- --scenario voice-demo
```

Add a new scenario that calls your custom tool and asserts on the response. Keep harness scripts alongside the feature so reviewers can run them easily.

---

## 8. Prepare for production

1. Containerise or deploy via PM2 following `dexter-ops/ops/ecosystem.config.cjs`.  
2. Point environment variables to production services (Supabase, OpenAI, MCP).  
3. Configure Cloudflare Turnstile and SSO providers as required.  
4. Set up monitoring (Prometheus/Grafana or use the built-in Status page).  
5. Update docs and create a runbook for the operations team.

---

## Where to go next

- [API Reference](../appendix/api-reference.md) – endpoints and schemas you can call directly.  
- [Glossary](../appendix/glossary.md) – shared vocabulary across the stack.  
- [Voice Connector Guide](../connectors/dexter-voice.md) – if you’re extending the realtime surface.  
- `#dexter-dev` Slack channel – architecture questions, RFCs, and code review pings.

Happy building!  
