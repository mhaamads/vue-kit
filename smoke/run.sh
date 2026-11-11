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
npm install --no-save --no-package-lock --no-audit --no-fund ../moonlinetravel-vue-kit-*.tgz
npx vue-tsc --noEmit
npx vitest run
npx vite build --logLevel warn

# Tailwind found the kit's classes through theme.css's own @source, and the app's token override won.
css=$(cat dist/assets/*.css)
for needle in "from-primary-orange-500" "z-toasts" "#0a7d3e" "data-theme=dark"; do
  case "$css" in *"$needle"*) ;; *) echo "smoke: built CSS is missing $needle"; exit 1 ;; esac
done
echo "smoke: OK"
