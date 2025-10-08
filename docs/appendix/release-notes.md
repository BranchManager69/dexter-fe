# Release Notes

We publish high-level release notes so operators and integrators can track major Dexter changes. Dates use ISO (YYYY‑MM‑DD). Minor bug fixes and copy tweaks roll out continuously and may not appear here.

---

## 2025

### 2025‑10‑01 — Voice Beta Expansion
- Expanded managed-wallet coverage to all pro-tier customers.  
- Added live Solana execution narration and receipts webhooks.  
- Introduced the homepage **Voice trading beta** CTA with quicker access to `/voice`.  
- Shipped the two-column roadmap stack and connector copy refresh.

### 2025‑08‑22 — Connector Upgrade
- ChatGPT and Claude connectors now share a unified OAuth pipeline.  
- Added `handoff_voice` tool for instant voice escalation.  
- Published updated quick-start docs for users and integrators.

### 2025‑07‑15 — MCP Tooling Refresh
- Introduced `solana_swap_execute` with preview + confirmation flow.  
- Refactored wallet resolver to honour Supabase tier entitlements.  
- Added harness scenarios covering swap preview/execute and balance lookups.

### 2025‑05‑30 — Alexa Skill Private Beta
- Launched the Alexa Skill with portfolio checks and macro triggers.  
- Documented certification requirements and Turnstile gating for OAuth.  
- Added MCP diagnostics toolset for internal testing.

### 2025‑03‑18 — Dexter FE App Router Launch
- Migrated the marketing and app surfaces to Next.js App Router.  
- Introduced Supabase-authenticated `/chat` and `/voice` routes.  
- Bundled the realtime harness with Playwright regression flows.

---

## 2024

### 2024‑11‑12 — MCP Bridge v1
- Released `dexter-mcp`, exposing wallet, solana, and general toolsets through HTTP + stdio transports.  
- Added MCP JWT support so connectors can authenticate per user.  
- Published the first version of this documentation hub.

### 2024‑08‑03 — Supabase Identity Migration
- Consolidated user auth into Supabase magic links and profiles.  
- Added tier-based entitlements (`guest`, `member`, `pro`, `internal`).  
- Enabled managed-wallet provisioning during sign-up.

### 2024‑05‑19 — Voice Prototype
- Demoed the initial OpenAI Realtime integration with single-command swaps.  
- Logged transcripts + receipts to Supabase for compliance review.  
- Added the `voice@dexter.cash` support channel.

---

Looking for older history? Check the `CHANGELOG.md` files in each repo or the archived releases page inside `docs/internal/release-notes`.  
