#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BUILD_DIR="$ROOT_DIR/_book"
ASSET="$ROOT_DIR/assets/favicon.ico"

if [ -f "$ASSET" ]; then
  cp "$ASSET" "$BUILD_DIR/favicon.ico"
  mkdir -p "$BUILD_DIR/gitbook/images"
  cp "$ASSET" "$BUILD_DIR/gitbook/images/favicon.ico"
fi
