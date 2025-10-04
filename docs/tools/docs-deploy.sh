#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BUILD_DIR="$ROOT_DIR/_book"
PUBLISH_DIR=${DOCS_PUBLISH_DIR:-/var/www/docs.dexter.cash}

npm --prefix "$(cd "$ROOT_DIR/.." && pwd)" run docs:build

echo "Publishing docs from $BUILD_DIR to $PUBLISH_DIR"

SUDO_CMD=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO_CMD="sudo"
fi

$SUDO_CMD mkdir -p "$PUBLISH_DIR"
$SUDO_CMD rsync -a --delete "$BUILD_DIR/" "$PUBLISH_DIR/"

echo "Docs published to $PUBLISH_DIR"
