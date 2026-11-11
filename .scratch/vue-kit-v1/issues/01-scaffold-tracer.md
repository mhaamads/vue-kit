# 01: Scaffold tracer: one util, built, packed, consumed

**What to build:** The thinnest end-to-end path a consumer will use. vue-kit builds, packs and installs into a separate Vite app, which imports `formatDate` from `@moonlinetravel/vue-kit/utils` with full types. CI proves this on every push. Every later ticket extends this path instead of inventing its own.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Toolchain in place: TypeScript, Vue 3.5 `<script setup>`, Vite library mode (ESM, preserved modules, `vue` external + `peerDependency`), declaration output via `vue-tsc`, ESLint flat config + Prettier (no semicolons, single quotes, 100 cols) with portal-iq-vue's component rules, Vitest with `@vitejs/plugin-vue`, `happy-dom` and `@vue/test-utils`.
- [x] `package.json` is private-registry ready: name `@moonlinetravel/vue-kit`, `publishConfig.registry` set to GitHub Packages, an `exports` map with `./utils`, `./http`, `./ui` and `./theme.css` (empty stubs are fine for the ones not built yet), and `files` limited to the build output.
- [x] `./utils` exports `formatDate` (date-only and date-time formats, no date library). Its tests import from the public entry point only.
- [x] Pack-and-consume smoke test: build, `npm pack`, install the tarball into a minimal Vite + Tailwind v4 fixture app, run `vue-tsc` on the fixture, and run a test there that imports and calls `formatDate`.
- [x] Lint blocks imports of portal-iq-vue paths and of packages outside the allow-list. A dependency-guard test fails if any UI source file imports a package outside the allow-list.
- [x] ADR-0011 records the full allow-list: `vue` (peer), `maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`, `@iconify/vue`, `@vueuse/core`, `vue-virtual-scroller`. `RouterLink` is resolved at runtime, so `vue-router` is not a dependency.
- [x] A CI workflow runs type-check, lint, unit tests, build and the smoke test on every push and pull request.
- [x] No auto-import plugin. Every file imports its Vue APIs explicitly.
