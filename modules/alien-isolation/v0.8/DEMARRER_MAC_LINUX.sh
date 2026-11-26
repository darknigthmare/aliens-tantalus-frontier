#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
 printf '%s\n' 'Node.js 20 ou plus récent est requis. Le HTML autonome reste utilisable séparément.'
 exit 1
fi
exec node tools/serve.mjs --open
