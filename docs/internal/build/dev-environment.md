# Development Environment

Dexter uses Next.js 15 with the App Router, TypeScript strict mode, and PNPM-style path aliases resolved through the `tsconfig.json` compiler options.

## Prerequisites
- Node.js 20.x (match the version in `.nvmrc`).
- `npm ci` for clean installs; we pin dependencies via `package-lock.json`.
- Supabase credentials for authenticated routes (store them in `.env.local`).

## Common scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Starts the dev server on http://localhost:3017 using `.env.local`. |
| `npm run build` | Produces the production bundle in `.next/`. |
| `npm run start` | Serves the production build locally. |
| `npm run harness` | Replays realtime flows and validates MCP tool usage. |
| `npx next lint` | Runs the lint suite (use before every PR). |

## Environment variables
Copy `.env.example` to `.env.local` and provide any new keys here as you add features. Never hardcode secrets in client components; tunnel sensitive calls through API routes under `app/api/`.

## Testing
Until we add a broader runner, stage automated suites in `tests/` and document coverage expectations in your PRs. For UI or auth changes, smoke-test `/chat` and `/voice` with a Supabase-authenticated user.

Need backend docs? Jump to the `dexter-api` repository for API contracts and MCP definitions.
