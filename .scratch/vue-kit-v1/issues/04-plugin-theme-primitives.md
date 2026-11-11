# 04: Plugin, theme and first primitives

**What to build:** An app developer calls `app.use(createVueKit(options))`, imports `theme.css` and adds one `@source` line. Themed `AppText`, `AppIcon` and `AppButton` then render in their app, including dark mode, RTL and token overrides.

**Blocked by:** 01 (Scaffold tracer).

**Status:** resolved

- [x] `createVueKit` accepts `dir`, `messages` (partial, merged over English defaults), `components` (override keys for every v1 input) and `devBypassValidation`. It provides them through typed injection keys, and each one has a default, so components also work without the plugin.
- [x] `theme.css` ships the colour tokens and the `dark` custom variant on `[data-theme=dark]`. The fixture overrides one token in its own `@theme` and sees the new colour.
- [x] `ZIndex` scale (layout, dialog, toast and dropdown layers) exported together with the matching `z-*` utilities in `theme.css` (moved from ticket 03).
- [x] `AppText`: size, weight and colour scale; text only (no HTML mode).
- [x] `AppIcon`: Iconsax-backed, with icon-name types.
- [x] `AppButton`: variants, sizes, icon, loading and disabled. With `to` it renders the app's registered `RouterLink` when there is one, otherwise an `<a>`. No `vue-router` import.
- [x] `dir: 'rtl'` mirrors the button's icon side, and all classes are logical (lint-checked).
- [x] Tests mount through the installed plugin and assert DOM and ARIA only.
- [x] The smoke fixture renders a themed `AppButton` from the installed package, and Tailwind generates its classes.

## Notes (resolved 2026-11-11)

- `theme.css` registers its own `@source`, so consumers only `@import` it; no extra `@source` line. The smoke test proves this both ways (classes are missing when the line is removed).
- `theme.css` deliberately leaves out portal's global styles (Google Fonts import, `html *` font, scrollbar styling, the global `button` cursor) because they belong to the app. `AppButton` sets its own `cursor-pointer`.
- `IconName` (993 names) is generated from the installed `vue-iconsax` by `scripts/gen-icon-names.mjs`; a test fails if it drifts. `vue-iconsax` has no types, so the kit declares `VsxIcon` locally (not exposed in `dist` types).
- The loading spinner is an inline SVG instead of `@iconify/vue`, which fetches icon data from `api.iconify.design` at runtime. `@iconify/vue` stays on the ADR-0011 list but is not installed.
- API changes vs portal (no consumers yet): `classList` / `textClassList` / `iconClassList` / `activeClassList` → plain `class` (merged with `tailwind-merge`, caller wins); `AppText` drops `htmlContent`, `fontFamily` and the `capitalize` / `uppercase` / `underline` / `italic` flags (use classes); `AppButton` gains a `disabled` prop and a dev-only warning for icon-only buttons without an accessible name; `AppIcon` defaults to `currentColor` instead of `#000`.
- `dir` is provided by the plugin, but no v1 component needs it in JS yet; logical CSS classes handle mirroring (RTL guard test).
