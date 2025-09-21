#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm >= 20 is required to bootstrap dexter-fe" >&2
  exit 1
fi

pushd "$ROOT_DIR" >/dev/null

npm install

# Pre-build the Next.js bundle so cached Codex containers can serve immediately.
if npm run build >/dev/null 2>&1; then
  echo "Next.js build completed"
else
  echo "Next.js build failed (check dependencies); continuing" >&2
fi

cat <<'NOTE'
This setup script does not create a .env file.
Configure NEXT_PUBLIC_* and other runtime variables via Codex Cloud (dashboard or future
`codex env set` tooling) before launching the frontend.
NOTE

popd >/dev/null
