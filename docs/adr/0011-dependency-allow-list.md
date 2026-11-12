# 0011. Runtime dependency allow-list

Status: Amended by ADR-0012 (2026-11-12): the allow-list is now vue, maska, @floating-ui/vue, @vueuse/core. Extends ADR-0010.

## Context

ADR-0010 bans heavy UI libraries and keeps small utilities. Its list (`maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`) left out three small utilities that the v1 primitives use in portal-iq-vue: `@iconify/vue` (button, select and checkbox icons), `@vueuse/core` (select, `formatDate`) and `vue-virtual-scroller` (long option lists). The owner approved adding them while reviewing the spec.

## Decision

vue-kit's runtime dependencies are limited to:

- `vue` (peer)
- `maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`
- `@iconify/vue`, `@vueuse/core`, `vue-virtual-scroller`

A package is added to `package.json` only when the first code that needs it lands. `vue-router` is not a dependency: `AppButton` resolves `RouterLink` at runtime when the app has registered it.

## Consequences

- Two checks enforce the list. Lint (`no-restricted-imports` in `src/`) allows only relative imports and the packages declared in `package.json`. The dependency-guard test fails if `package.json` declares, or `src/` imports, anything outside this list.
- Changing the list needs a new ADR plus an update to the guard test.
