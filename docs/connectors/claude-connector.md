# Claude Connector

The Claude connector places Dexter’s tooling inside Anthropic’s Claude Workbench and shared chats. It mirrors the ChatGPT integration but uses Anthropic’s **Tool Use** and **MCP over HTTPS** betas, making it ideal for teams standardised on Claude 3.5 Sonnet or Claude 3 Opus.

---

## What the connector offers

- **Managed wallet insight** – Claude can inspect balances, list recent trades, and produce reconciliations using Dexter’s wallet toolset.  
- **Macro execution** – Operators can ask Claude to “run the daily unwind macro,” and Dexter executes the pre-approved workflows while Claude narrates the progress.  
- **Research assist** – Claude can call the pumpstream analytics tools and in-house knowledge base to augment its completions.  
- **Structured receipts** – Every tool call returns structured JSON that Claude can summarise or attach to reports.  
- **Seamless handoff** – Claude can send a one-click link to Dexter Voice for realtime execution when a conversation escalates.

---

## Prerequisites

1. **Anthropic account** with Tool Use and MCP support. (Contact Anthropic support if the toggle is missing.)  
2. **Dexter user** with `channels.claude = true` in Supabase.  
3. **dexter-mcp** reachable via HTTPS (`https://mcp.dexter.cash/mcp`).  
4. **OAuth client** minted in `dexter-api` for Claude (`node scripts/create-oauth-client.mjs claude`).  
5. **Allowed origins** – Ensure `https://anthropic.com` is in the CORS allowlist for `dexter-mcp` if you serve it from a custom domain.

---

## Configure Claude Workbench

1. **Create a Workspace tool profile**  
   - Open Claude’s Workbench, click **Workspace → Tools & MCP**.  
   - Choose **Add MCP Server → HTTP**.  
   - Enter:  
     ```
     Name: Dexter MCP
     Base URL: https://mcp.dexter.cash/mcp
     ```
   - Under **Authentication**, choose **OAuth 2.0** and add:
     - Authorization URL: `https://api.dexter.cash/oauth/claude/authorize`  
     - Token URL: `https://api.dexter.cash/oauth/claude/token`  
     - Client ID/Secret: generated earlier  
     - Scopes: `mcp:invoke wallet:read profile`

2. **Select toolsets**  
   - In the MCP configuration, enable the bundles relevant to Claude’s tasks: `wallet`, `solana`, `general`.  
   - If you have internal-only tools (e.g., diagnostics), leave them unchecked. Claude will only see allowed tools.

3. **Link your Dexter account**  
   - When you open a Claude conversation, it will prompt you to authorise the MCP server.  
   - Complete the Dexter OAuth flow (Turnstile + email login).  
   - The session is valid for one hour; Claude automatically refreshes tokens until you revoke access.

4. **Test the integration**  
   - Ask Claude: “Use Dexter to list the balances for my vault wallet.”  
   - You should see a tool call appear in the right rail, followed by Claude’s summary of the JSON response.  
   - Run a macro: “Use Dexter to run the hedging macro.” Claude will confirm the intent, send the command, and summarise the result.

---

## Recommended prompt scaffolding

We suggest adding the following to Claude’s system prompt when sharing with your team:

```
You have access to Dexter’s MCP tools. Prefer tools for balance checks, price lookups, macro execution,
and pulling receipts. Never fabricate wallet data. If a user requests a free-form trade or an unsupported
action, hand off to Dexter Voice via the `handoff_voice` tool.
```

This keeps completions consistent and reduces hallucinations about unsupported actions.

---

## Limitations

- **No direct voice** – Claude can generate a Dexter Voice link, but it cannot stream live audio itself.  
- **Execution approvals** – Swap executions still require confirmation in Dexter’s UI; Claude will show a “pending approval” message until you accept.  
- **Tool quotas** – Large batches of macro calls are rate-limited (default: 30 per minute). Adjust in `dexter-api` if you run high-volume automations.

---

## Troubleshooting

| Issue | What to check | Fix |
|-------|----------------|-----|
| Claude says “Dexter MCP is unavailable.” | MCP endpoint offline or CORS blocked | Confirm `dexter-mcp` is running and that `TOKEN_AI_MCP_CORS` includes Claude’s origin. |
| OAuth window loops | Callback mismatch | Ensure the redirect URI in Anthropic matches `https://api.dexter.cash/oauth/claude/callback`. |
| Tool errors with `403` | Entitlement missing | Verify the Supabase profile tier grants access to the requested tool bundle. |
| Macro executes twice | Conversation retried | Claude may retry failed generations. Use idempotency keys in your macros or ask Claude to confirm before re-running. |
| Receipt missing | Webhook failure | Check the PM2 logs for `dexter-api` receipts worker; ensure the webhook endpoint responded `200`. |

---

## Revoking access

- **Single user** – Open the Dexter settings page (`/settings/security`) and click **Revoke** next to “Claude connector.”  
- **Entire org** – Delete the OAuth client in `dexter-api` and remove the MCP server from Claude Workbench.

Send connector feedback or feature requests to **connectors@dexter.cash**.  
