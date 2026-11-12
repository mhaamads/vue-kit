#!/bin/sh
# Pack-and-consume smoke test: build vue-kit, pack it, install the tarball into
# a separate Vite + Tailwind v4 app, then type-check, test and build that app.
set -eu
cd "$(dirname "$0")/.."

npm run build
rm -f smoke/*.tgz
npm pack --pack-destination smoke --silent

cd smoke/fixture
rm -rf node_modules
npm install --no-save --no-package-lock --no-audit --no-fund ../mhaamads-vue-kit-*.tgz
npx vue-tsc --noEmit
npx vitest run
npx vite build --logLevel warn
echo "smoke: OK"
