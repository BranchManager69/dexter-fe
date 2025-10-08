# API Reference Links

Dexter exposes a small set of HTTP endpoints and MCP tool definitions. This appendix collects the key references so you can jump into deeper docs or source code quickly.

---

## dexter-api (REST)

Base URL (prod): `https://api.dexter.cash`  
Base URL (local dev): `http://localhost:3030`

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/realtime/sessions` | POST | Mint an OpenAI Realtime session token with Dexter metadata. | Accepts optional Supabase access token. |
| `/mcp/invoke` | POST | Proxy an MCP tool call via HTTP. | Used by connectors and tests. |
| `/wallets` | GET | List managed wallets for the authenticated user. | Requires Supabase JWT. |
| `/wallets/refresh` | POST | Force-refresh wallet balances. | Internal token only. |
| `/receipts` | GET | Paginated receipts (transcripts + fills). | Filter by wallet, connector, or date. |
| `/automations/macros` | GET/POST | Read or trigger macros. | Create via POST, execute via `/run`. |
| `/oauth/{connector}/authorize` | GET | OAuth entry for connectors (chatgpt, claude, alexa). | Redirects to Supabase magic link if needed. |
| `/oauth/{connector}/token` | POST | Token exchange for connectors. | Returns access + refresh tokens + MCP JWT (if enabled). |
| `/connectors/chatgpt/openapi.json` | GET | OpenAPI spec ChatGPT imports. | Auto-generated from MCP metadata. |

Full source with TypeScript types lives in `dexter-api/src/routes`. Auto-generated Swagger docs are available locally at `http://localhost:3030/docs`.

---

## Webhooks

Dexter delivers webhooks for receipts and alerts. Configure targets under **Settings → Notifications** or via the API.

**Receipt webhook payload**

```json
{
  "event": "receipt.created",
  "receipt": {
    "id": "rec_0145fa",
    "walletId": "wal_treasury",
    "connector": "voice",
    "transcript": "...",
    "signature": "5QpH....",
    "metadata": {
      "command": "buy",
      "assets": ["SOL", "JUP"],
      "notionalUsd": 1250.42
    },
    "createdAt": "2025-10-08T00:22:10.901Z"
  }
}
```

**Alert webhook payload**

```json
{
  "event": "alert.triggered",
  "alert": {
    "id": "alt_sol_drop",
    "type": "price_below",
    "threshold": 90,
    "asset": "SOL",
    "direction": "down",
    "firedAt": "2025-10-08T02:45:01.112Z"
  }
}
```

We sign webhook requests with the header `X-Dexter-Signature` (HMAC SHA-256). Verify on your end using the shared secret displayed in the UI.

---

## MCP Tool Definitions

The MCP server (`dexter-mcp`) exposes tools grouped by bundle. Query `GET /mcp/tools` with the `tools` query parameter to fetch metadata.

| Bundle | Example tools | Use cases |
|--------|---------------|-----------|
| `wallet` | `wallet/list_my_wallets`, `wallet/set_session_wallet_override` | Identify managed wallets, override session defaults. |
| `solana` | `solana_resolve_token`, `solana_swap_preview`, `solana_swap_execute`, `solana_list_balances` | Token lookup, trade simulation, execution. |
| `general` | `general/search`, `pumpstream_live_summary`, `general/alerts_create` | Knowledge-base queries, analytics, alert management. |
| `custom` | (varies per deployment) | Your custom diagnostics or partner integrations. |

Each tool definition includes:

- `title`, `description`  
- `_meta` (category, access tier, tags)  
- `inputSchema` (zod schema)  
- Tool handler output structure (text content + optional structured content)

See `dexter-mcp/toolsets/*` for actual implementations.

---

## SDK & Harness

- **JavaScript helper:** `dexter-api/src/lib/client.ts` exports a minimal client for calling API endpoints with proper headers.  
- **Harness CLI:** `npm run harness -- --scenario voice-demo` exercises `/realtime/sessions`, MCP calls, and receipts end to end.  
- **Postman collection:** `docs/assets/api/Dexter.postman_collection.json`.

---

## Additional resources

- [dexter-api README](../../dexter-api/README.md#key-endpoints)  
- [dexter-mcp README](../../dexter-mcp/README.md#toolsets)  
- [dexter-fe README](../../README.md) (front-end structure)  
- [Governance forum](https://forum.dexter.cash) for API deprecation notices and upcoming changes

Have an endpoint request? Open an issue labeled `api/feature` in the `dexter-api` repo or email **api@dexter.cash**.  
