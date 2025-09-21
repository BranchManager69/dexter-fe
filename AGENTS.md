# Repository Guidelines

## Project Structure & Module Organization
- `app/` (Next.js App Router) owns routing and API proxies; key surfaces are `page.tsx`, `chat/`, `voice/`, `link/`.
- Shared UI/state sit alongside routes (`app/components/`, `auth-context.tsx`, `header.tsx`, `footer.tsx`), while helpers live under `lib/`.
- Tooling and docs live in `cli/` (realtime harness + scripts), `docs/`, `examples/`, and static assets stay in `public/`.

## Build, Test, and Development Commands
- `npm run dev` – launch the dev server on `http://localhost:3017`, reading `.env.local`.
- `npm run build` / `npm run start` – build production output to `.next/` and serve it locally.
- `npm run harness` (or `node ./cli/realtime-harness/run.mjs`) – replay realtime flows and assert MCP tool usage.
- `npm ci` – lockfile-faithful install for fresh checkouts or CI nodes.

## Coding Style & Naming Conventions
- TypeScript is strict; avoid `any`, type props explicitly, and prefer guard clauses over nested branches.
- Use two-space indentation, single quotes in TSX/TS, and trailing commas in multiline literals.
- Components export PascalCase identifiers; hooks/utilities remain camelCase and colocate near their consumers.
- Run `npx next lint` before reviews; justify waived lint rules via inline comments.

## Testing Guidelines
- Extend the harness scenarios in `cli/realtime-harness/run.mjs` whenever new tools or flows ship.
- Supply credentials through env vars (`HARNESS_COOKIE`, `HARNESS_AUTHORIZATION`, `HARNESS_FRONTEND_ORIGIN`) rather than editing code.
- Smoke-test `/chat` and `/voice` with a Supabase-authenticated user for UI/auth changes.
- Until we adopt a broader runner, stage new automated suites in a `tests/` directory and document coverage expectations in the PR.

## Commit & Pull Request Guidelines
- Match the log history: concise, imperative subjects with optional scope prefixes (`fe:`, `docs:`).
- Keep commits focused and note API/auth/env impacts in the body.
- PRs should summarize changes, list manual/harness verification, and attach screenshots or clips for UX updates.
- Link tracking tickets and flag required configuration steps up front; request realtime-platform reviewers for auth or MCP changes.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`, document new keys there, and keep secrets out of source.
- Proxy sensitive calls via API routes like `app/api/tools/route.ts`; never embed keys in client components.
- Switch environments through env vars (`NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_ENABLE_VOICE`) and exclude temporary harness logs or `.next/` artifacts from commits.
