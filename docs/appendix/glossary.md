# Glossary

Common terms you’ll see across Dexter documentation, UI copy, and support tickets. Terms are listed alphabetically.

---

### Alerts
Rules that fire when a metric (price, volume, wallet balance) crosses a threshold. Alerts can trigger email/webhook notifications or kick off macros.

### Anthropic Tool Use
Anthropic’s framework for letting Claude call external tools. Dexter exposes its MCP tools through this interface so Claude can query balances or run macros.

### API (dexter-api)
The TypeScript service that mints realtime sessions, proxies MCP calls, manages receipts, and exposes helper routes (`/realtime/sessions`, `/mcp/invoke`, `/wallets`). Runs on Node.js with PM2 in production.

### Connector
An external surface (ChatGPT, Claude, Alexa, web overlays) that talks to Dexter through OAuth + MCP. Connectors never see private keys—only scoped tokens.

### Deep Health
The internal dashboard that aggregates service health (Supabase latency, MCP error rates, realtime session success). “Deep Health green” means no incidents.

### DEXTER Token
A Solana-based utility token that unlocks execution credits, premium connector features, staking quotas, and governance rights. See [Dexter Tokenomics](../welcome/dexter-tokenomics.md).

### Harness
The Playwright-based test runner that replays realtime sessions and MCP flows. Located at `cli/realtime-harness/run.mjs`. Run it before shipping changes that touch Voice or connectors.

### LBA (Liquidity Bootstrap Auction)
The mechanism Dexter uses to distribute the initial DEXTER token supply while seeding liquidity pools.

### Managed Wallet
A non-custodial wallet managed by Dexter’s custody layer. Operators never see the seed phrase; trades execute through MPC flows controlled by the platform.

### MCP (Model Context Protocol)
OpenAI’s protocol for exposing tools to LLMs. Dexter hosts its own MCP bridge (`dexter-mcp`) which groups tools by category (wallet, solana, general, custom).

### Macro
A scripted series of MCP tool calls (e.g., “sell hedges, buy the rebalance basket, update dashboards”). Macros can be triggered via Voice, chat, or connectors.

### PM2
The process manager Dexter uses for production deployments. Each surface (API, FE, MCP, Agents) has a PM2 entry managed via `dexter-ops`.

### Receipt
A structured record containing the transcript, transaction signature, guardrails, and metadata for a completed action. Stored in Supabase and exposed via `/receipts`.

### Supabase
Dexter’s identity and data store. Handles authentication (magic links), session records, wallet metadata, and receipts.

### Tier
A role classification (`guest`, `member`, `pro`, `internal`) that gates which MCP tools and connectors a user can access. Tiers map to Supabase profile fields.

### Turnstile
Cloudflare’s CAPTCHA alternative used at sign-in and OAuth entry points. Keeps bots out of the Voice and connector flows.

### Voice Session
A realtime WebRTC conversation with Dexter Voice. Includes mic streaming, transcription, execution, and receipts. Sessions auto-expire after 90 seconds of silence.

---

Missing a term? Open an issue in `dexter-fe` with the label `docs/glossary` or ping `#dexter-docs`.  
