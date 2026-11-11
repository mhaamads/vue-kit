# CLAUDE.md

`@moonlinetravel/vue-kit`: a shared Vue 3 + TypeScript library (utils, HTTP client, overridable input system) for new Moonline apps. Published to GitHub Packages.

- Decisions live in `docs/adr/`. Read them before changing scope, dependencies, styling or the release flow.
- Planning docs live in `docs/shared-package/`: the inventory, the research and the input design.
- `../portal-iq-vue` is **read-only reference code** (ADR-0001). Port behaviour from it into this repo. Never edit it, and never make it depend on vue-kit.
- No heavy UI libraries (ADR-0010). Runtime deps are limited to the ADR-0011 allow-list; lint and `tests/dependency-guard.spec.ts` enforce it.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Commands

```sh
npm run build        # vite library build + vue-tsc declarations + theme.css → dist/
npm run type-check   # vue-tsc --build (app, tests, node configs)
npm run lint         # eslint . (includes the library import boundary)
npm test             # vitest run; tests import only @moonlinetravel/vue-kit/* (aliased to src)
npm run smoke        # build → npm pack → install tarball in smoke/fixture → vue-tsc + vitest + vite build
node scripts/gen-icon-names.mjs  # regenerate src/ui/icon-names.ts after upgrading vue-iconsax
```

Tests live in `tests/` and use only the public entry points. `smoke/fixture` is a separate consumer app with its own `package.json`; don't import it from `src/`.
