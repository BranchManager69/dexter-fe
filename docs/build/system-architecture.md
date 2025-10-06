# System Architecture

Dexter’s surface is split across a few repos in the `websites/` workspace. Use this map to understand who owns what.

## Frontend (`dexter-fe`)
- Next.js 15 App Router deployment served via PM2 (`dexter-fe` process).
- Routes under `app/` handle marketing pages (`/`, `/link`, `/voice`, `/chat`) and proxy requests to backend APIs where needed.
- MCP clients and realtime voice widgets are bundled here for browser delivery.

## API (`dexter-api`)
- Node/Express service that exposes REST + realtime endpoints for trading operations, compliance logs, and session management.
- Handles authentication, rate limiting, and integrates with Supabase for identity.
- MCP servers mount here to expose additional tools to the agents.

## Realtime agents (`dexter-agents`)
- Houses OpenAI realtime agent scenarios and shared orchestration for multi-agent chat + voice.
- Provides reference configs for production vs. demo environments.

## MCP Hub (`dexter-mcp`, `dexter-mcp-api`)
- Bridges external data sources and on-desk tools into the MCP contract Dexter expects.
- Each tool registers with the hub so agents can call it through the MCP SDK.

## Documentation site
- Markdown in this repo under `docs/` builds with HonKit.
- `docs/tools/docs-deploy.sh` publishes the rendered site to `/var/www/docs.dexter.cash` (override with `DOCS_PUBLISH_DIR` if you need a different target).

When rolling out platform changes, update the relevant repo docs and cross-link from the architecture section so operators know where new components live.
