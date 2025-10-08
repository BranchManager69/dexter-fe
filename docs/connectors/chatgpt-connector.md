# ChatGPT Connector

The ChatGPT connector lets portfolio managers and analysts stay inside OpenAI’s ChatGPT UI while Dexter handles wallet-aware execution, research, and compliance. Once connected, ChatGPT can call Dexter’s Model Context Protocol (MCP) tools on your behalf, stream status updates into the thread, and hand off to Dexter Voice if you want to keep talking.

---

## What it can do

- **Managed-wallet operations** – Inspect balances, fetch token metadata, and run pre-approved swaps or macros through `solana_*` tools.  
- **Intelligence retrieval** – Pull pump.fun dossiers, market snapshots, and internal knowledge-base answers using the `general/search` toolset.  
- **Session logging** – Every tool call returns a receipt that Dexter stores in Supabase, keeping the ChatGPT transcript audit-ready.  
- **Voice handoff** – ChatGPT can open a secure link to Dexter Voice in case you need realtime narration mid conversation.

ChatGPT never sees your private keys or MCP tokens; OAuth + short-lived JWTs keep tool access scoped to your identity.

---

## Enable the connector

1. **Prerequisites**
   - A Dexter account with the ChatGPT channel enabled (`channels.chatgpt = true` in Supabase).  
   - `dexter-api` reachable from ChatGPT (public HTTPS).  
   - MCP toolsets published via `dexter-mcp` (wallet, solana, general).  
   - At least one managed wallet and any premium bundles you plan to expose.

2. **Create the GPT**  
   - From the ChatGPT interface, click **Explore GPTs** → **Create a GPT**.  
   - Give it a name (e.g., “Dexter Console”) and describe the assistant’s purpose.  
   - Under **Configure → Actions**, click **Add Action** and choose **Import from URL**.  
   - Paste `https://api.dexter.cash/connector/chatgpt/openapi.json`. ChatGPT will pull the OpenAPI spec that proxies Dexter’s MCP tools.

3. **Set authentication**  
   - Still under **Actions**, choose **Authentication → OAuth**.  
   - Authorization URL: `https://api.dexter.cash/oauth/chatgpt/authorize`  
   - Token URL: `https://api.dexter.cash/oauth/chatgpt/token`  
   - Client ID/Secret: generate with `node scripts/create-oauth-client.mjs chatgpt` in `dexter-api`.  
   - Scopes: `mcp:invoke wallet:read profile`.

4. **Save & share**  
   - Save the GPT.  
   - For internal testing, keep it **Only me**. For a team rollout, share with specific email domains or publish to the GPT Store (requires OpenAI approval).

5. **Link accounts**  
   - In the ChatGPT conversation, click **Enable Actions** → **Connect** when prompted.  
   - Complete the Dexter OAuth flow (Turnstile + email login).  
   - Once linked, ChatGPT can call the Dexter endpoints for that user.

---

## Supported actions

| Action | Description | MCP tool invoked |
|--------|-------------|------------------|
| `get_portfolio` | Returns managed wallet balances (SOL + SPL) for the active user. | `wallet/list_my_wallets`, `solana_list_balances` |
| `resolve_token` | Finds token metadata, symbols, and live price. | `solana_resolve_token` |
| `swap_preview` | Simulates a swap (exact-in/out) with expected output and routing. | `solana_swap_preview` |
| `swap_execute` | Executes a pre-approved swap from a managed wallet. User must confirm in Dexter. | `solana_swap_execute` |
| `get_alerts` | Lists active price/volume alerts. | `general/alerts_list` |
| `create_alert` | Registers a new alert. | `general/alerts_create` |
| `handoff_voice` | Generates a time-limited link to Dexter Voice with context. | Internal API call |

Actions that change state (e.g., `swap_execute`) are gated behind a confirmation prompt inside ChatGPT. The connector sends the request, Dexter pops a notification in the web UI or mobile app, and the trade executes once you approve.

---

## Best practices

- **Set a system prompt** for ChatGPT to remind users that executions require confirmation (“Dexter will verify sensitive commands before executing”).  
- **Limit macros** to deterministic operations. If a macro needs human review, call `handoff_voice` instead.  
- **Timeout awareness** – OAuth tokens expire after 1 hour; ChatGPT handles refreshes automatically, but if you revoke consent in Dexter, expect the next action to fail with `401`.

---

## Troubleshooting

| Problem | Resolution |
|---------|------------|
| Actions tab missing | Only GPT Builder accounts can add actions. Make sure you are in the correct ChatGPT tier (Plus or Enterprise). |
| OAuth loop | Check that the Callback URL in OpenAI matches the one configured in `dexter-api` (`/oauth/chatgpt/callback`). |
| `403 tool_not_allowed` | The user’s tier may not include the requested MCP tool. Confirm entitlement in Supabase (`profiles.tier`). |
| Swap does nothing | Dexter waits for confirmation. Check the Dexter web UI (bell icon) or the receipts feed for a pending approval. |
| Missing handoff link | `handoff_voice` only returns URLs if `NEXT_PUBLIC_ENABLE_VOICE` is true in the destination environment. |

Collect logs from `dexter-api` (`pm2 logs dexter-api --lines 100 --nostream`) and include the request ID that ChatGPT shows when reporting an error.

---

## Removal / revocation

- To revoke the connector for a single user, visit `Settings → Linked Accounts` in ChatGPT and disconnect “Dexter”.  
- To revoke org-wide, delete the OAuth client in `dexter-api` (`DELETE /oauth/clients/:id`).  
- Always rotate the client secret when moving from staging to production.

Need a walkthrough with screenshots? Send feedback to **connectors@dexter.cash** or hop into `#dexter-connectors`.  
