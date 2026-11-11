# CLAUDE.md

`@moonlinetravel/vue-kit`: a shared Vue 3 + TypeScript library (utils, HTTP client, overridable input system) for new Moonline apps. Published to GitHub Packages.

- Decisions live in `docs/adr/`. Read them before changing scope, dependencies, styling or the release flow.
- Planning docs live in `docs/shared-package/`: the inventory, the research and the input design.
- `../portal-iq-vue` is **read-only reference code** (ADR-0001). Port behaviour from it into this repo. Never edit it, and never make it depend on vue-kit.
- No heavy UI libraries (ADR-0010). `src/ui` may import only `vue`, `maska`, `@floating-ui/vue`, `tailwind-merge` and `vue-iconsax`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
