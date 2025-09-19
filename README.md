<p align="center">
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0ODAgMTYwIiBmaWxsPSJub25lIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMWUyOTNiIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB4PSIxMiIgeT0iMTIiIHdpZHRoPSI0NTYiIGhlaWdodD0iMTM2IiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZCkiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHJlY3QgeD0iMjIiIHk9IjIyIiB3aWR0aD0iNDM2IiBoZWlnaHQ9IjExNiIgcng9IjE4IiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS1vcGFjaXR5PSIwLjQ1IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI1MCUiIHk9Ijc0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZTBmMmZlIiBmb250LWZhbWlseT0iJ1NGIFBybyBEaXNwbGF5JywnU2Vnb2UgVUknLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSI2MDAiIGxldHRlci1zcGFjaW5nPSI0Ij5ERVhURVI8L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSIxMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzOGJkZjgiIGZvbnQtZmFtaWx5PSInU0YgTW9ubycsJ0pldEJyYWlucyBNb25vJywnRmlyYSBDb2RlJyxtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjgiIGxldHRlci1zcGFjaW5nPSIxMCI+U1RBQ0s8L3RleHQ+Cjwvc3ZnPgo=" alt="Dexter Stack wordmark" width="360">
</p>

<p align="center">
  <a href="https://github.com/BranchManager69/dexter-api">Dexter API</a>
  · <strong>Dexter FE</strong>
  · <a href="https://github.com/BranchManager69/dexter-mcp">Dexter MCP</a>
  · <a href="https://github.com/BranchManager69/dexter-ops">Dexter Ops</a>
  · <a href="https://github.com/BranchManager69/pumpstreams">PumpStreams</a>
</p>

<h1 align="center">Dexter FE</h1>

<p align="center">
  <a href="https://nodejs.org/en/download"><img src="https://img.shields.io/badge/node-%3E=20-green.svg" alt="Node >= 20"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/framework-Next.js%2014-black.svg" alt="Next.js 14"></a>
  <a href="#"><img src="https://img.shields.io/badge/status-alpha-orange.svg" alt="Alpha"></a>
</p>

Next.js frontend for the Dexter stack. It wires OpenAI’s Realtime APIs into a browser UI, handles Supabase auth,
and delegates tool orchestration to the API + MCP services.

---

## Highlights

- **Voice + chat demos** – `/voice` spins up a WebRTC session with ephemeral tokens from `dexter-api`; `/chat`
  drives the hosted agent over SSE.
- **Supabase-authenticated flows** – hooks into the shared Supabase project to surface managed wallets and pro tiers.
- **MCP-aware client** – delegates tool execution through the API so the browser never stores tool secrets or keys.
- **Lean Next.js footprint** – TypeScript + App Router with minimal dependencies; easy to fork for custom surfaces.

## Dexter Stack

| Repo | Role |
|------|------|
| [`dexter-api`](https://github.com/BranchManager69/dexter-api) | Issues realtime tokens, proxies MCP, x402 billing |
| [`dexter-mcp`](https://github.com/BranchManager69/dexter-mcp) | Hosted MCP transport powering tool access |
| [`dexter-ops`](https://github.com/BranchManager69/dexter-ops) | Shared operations scripts, PM2 config, nginx templates |
| [`pumpstreams`](https://github.com/BranchManager69/pumpstreams) | Pump.fun reconnaissance & analytics (adjacent tooling) |

Clone them alongside this repo (for example under `/home/branchmanager/websites/`) so local development can
reuse the shared `.env` cascade and PM2 scripts.

## Quick Start

```bash
git clone https://github.com/BranchManager69/dexter-fe.git
cd dexter-fe
npm ci
cp .env.example .env.local

# Point at your API origin (defaults to https://api.dexter.cash)
# NEXT_PUBLIC_API_ORIGIN=http://127.0.0.1:3030

npm run dev
# http://localhost:3017
```

The dev server hot-reloads while sourcing environment values from `.env.local`.

## Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_API_ORIGIN` | Base URL of `dexter-api` for realtime tokens + agent calls | `https://api.dexter.cash` |
| `NEXT_PUBLIC_MCP_ORIGIN` | Optional direct MCP origin for experimentation | (unset) |
| `NEXT_PUBLIC_ENABLE_VOICE` | Feature flag for the `/voice` route | `true` |

Environment loading follows Next.js conventions: `.env.local` > stage-specific files > `.env`. When this repo sits
next to `dexter-ops`, the shared loader in `dexter-api` can hydrate matching variables automatically, but keeping a
local `.env.local` avoids confusion.

## Key Routes

- `/` – marketing landing page
- `/voice` – launches an OpenAI Realtime session using an ephemeral token from the API
- `/chat` – text-only agent client streaming tokens over SSE
- `/oauth/callback` – Supabase-auth callback stub (filled by NextAuth setup)

Update `app/` routes or component entries to add surfaces; each page consumes the shared `api` client helpers under
`lib/` to talk to the backend.

## Scripts

- `npm run dev` – Next.js dev server on port 3017
- `npm run build` – production build to `.next`
- `npm run start` – serve the compiled output (`npm run build` first)
- `npm run lint` – lint with `next lint`

## Related Docs

- [dexter-api README](../dexter-api/README.md) – details on realtime session endpoints and MCP proxy
- [dexter-mcp README](../dexter-mcp/README.md) – available toolsets and authentication flows
- [dexter-ops README](../dexter-ops/README.md) – operations scripts and smoke tests

For UX specs or component guidelines, consult the design docs in `figma/` (internal) or open an issue tagged
`ux` for coordination.
