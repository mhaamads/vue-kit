# CLAUDE.md

`@mhaamads/vue-kit`: a shared Vue 3 + TypeScript library (utils, HTTP client, overridable input system) for new Vue apps. Published to GitHub Packages.

- Decisions live in `docs/adr/`. Read them before changing scope, dependencies, styling or the release flow.
- Planning docs live in `docs/shared-package/`: the inventory, the research and the input design.
- `../portal-iq-vue` is **read-only reference code** (ADR-0001). Port behaviour from it into this repo. Never edit it, and never make it depend on vue-kit.
- **Headless (ADR-0012):** `src/ui` renders no classes, no `<style>`, no icons; only behaviour and accessible markup with `data-*` hooks (`tests/ui/guards.spec.ts` enforces it). All visual work lives in the docs site `site/` (the example skin in `site/skin/`: `ui.ts` class map + `skin.css` tokens; no portal look). Every name the skin adds to an app is prefixed `vk` so it can't clash with the app's own: CSS variables `--vk-*`, Tailwind colours `*-vk-*` (`bg-vk-accent`), `font-vk`, utilities `vk-box` / `vk-button*`, transitions `.vk-toast-*`. Docs pages are short and ADHD-friendly: live example, code, props table, style keys. Runtime deps: vue, maska, @floating-ui/vue, @vueuse/core, @vuepic/vue-datepicker (ADR-0015; `tests/dependency-guard.spec.ts`).
- **Class maps (ADR-0014):** one component per field. Templates take classes only from `ui.<key>` (`useUi` in `src/ui/ui.ts`: app-wide `createVueKit({ ui })`, the component's own `ui` prop wins per key). A new rendered piece needs a new key in `ui.ts`. Buttons the kit draws are always `AppButton` with a variant (ADR-0015), and replaceable buttons get a slot exposing their function + `props`. Content changes go through slots (label / hint / errors on every input), so apps don't need the composables. Components must render on the server (`tests/ui/ssr.spec.ts`). Overlays: anything floating must work inside a modal `<dialog>` (top layer; outside is inert), so no teleport to `<body>`.
- **Languages (ADR-0008 amendment):** every built-in string comes from `useVueKit().messages` (English built in, other locales added by the app, switched live with `setLocale`). Read `messages.x` at render time, never copy it into a const at setup, or it stops following the language. Direction comes from the locale, not from component props.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Commands

```sh
npm run build        # vite library build + vue-tsc declarations → dist/
npm run type-check   # vue-tsc --build (app, tests, node configs)
npm run lint         # eslint . (includes the library import boundary)
npm test             # vitest run; tests import only @mhaamads/vue-kit/* (aliased to src)
npm run smoke        # build → npm pack → install tarball in smoke/fixture → vue-tsc + vitest + vite build
npm run docs         # docs site (VitePress) on http://localhost:5173 (dev only; not shipped)
npm run docs:build   # static docs in site/.vitepress/dist/
# Release: bump version + CHANGELOG.md, then push a v* tag; .github/workflows/release.yml publishes.
```

Tests live in `tests/` and use only the public entry points. `smoke/fixture` is a separate consumer app with its own `package.json`; don't import it from `src/`.
