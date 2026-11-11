# 04: Plugin, theme and first primitives

**What to build:** An app developer calls `app.use(createVueKit(options))`, imports `theme.css` and adds one `@source` line. Themed `AppText`, `AppIcon` and `AppButton` then render in their app, including dark mode, RTL and token overrides.

**Blocked by:** 01 (Scaffold tracer).

**Status:** ready-for-agent

- [ ] `createVueKit` accepts `dir`, `messages` (partial, merged over English defaults), `components` (override keys for every v1 input) and `devBypassValidation`. It provides them through typed injection keys, and each one has a default, so components also work without the plugin.
- [ ] `theme.css` ships the colour tokens and the `dark` custom variant on `[data-theme=dark]`. The fixture overrides one token in its own `@theme` and sees the new colour.
- [ ] `AppText`: size, weight and colour scale; text only (no HTML mode).
- [ ] `AppIcon`: Iconsax-backed, with icon-name types.
- [ ] `AppButton`: variants, sizes, icon, loading and disabled. With `to` it renders the app's registered `RouterLink` when there is one, otherwise an `<a>`. No `vue-router` import.
- [ ] `dir: 'rtl'` mirrors the button's icon side, and all classes are logical (lint-checked).
- [ ] Tests mount through the installed plugin and assert DOM and ARIA only.
- [ ] The smoke fixture renders a themed `AppButton` from the installed package, and Tailwind generates its classes.
