# 16: Headless package; the UI moves to Storybook

**What to build:** vue-kit ships behaviour only. Its components render accessible, unstyled HTML with `data-*` styling hooks, and apps own every visual decision. Storybook shows both the headless output and an example skin (portal's look), with detailed guides on how to style the kit. Presentation props such as radius have presets plus a custom value.

**Blocked by:** 04–14 (the components it reworks).

**Status:** resolved

- [x] ADR-0012 written; ADR-0006 superseded, ADR-0011's allow-list replaced (vue, maska, @floating-ui/vue, @vueuse/core).
- [x] `src/ui` has no classes, no `<style>` blocks and no icons. Removed: `theme.css`, `AppText`, `AppIcon`, `vue-iconsax`, `tailwind-merge`, the class maps, `ZIndex`, and every visual prop. Icon buttons became text from `messages`.
- [x] Styling hooks: `useField().dataAttrs` (`data-field`, `data-invalid`, `data-disabled`, `data-readonly`, `data-required`) plus component hooks (`data-state`, `data-open`, `data-active`, `data-selected`, `data-type`, `data-position`, `data-mode`, …).
- [x] Guard tests: no class or `<style>` in `src/ui`; inline styles only in `AppSelectSkin` (positioning and windowing behaviour); runtime deps limited to the new allow-list.
- [x] Storybook: each component has a "Headless" story (rendered with browser defaults) and "Skin" stories; Introduction, Guides → Styling (five techniques, when to use each, a hooks reference, good practice, radius) and Guides → Example skin (copyable source files).
- [x] Example skin in `stories/skin/`: `skin.css` (tokens, dark mode, `--ui-radius`, data-hook CSS), `radius.ts` (presets none…full plus any CSS length), `UiButton` / `UiInput` / `UiSwitch` (wrappers), `UiToasts` (slot), and `UiSelect` / `UiDateInput` / … (`skinned()` = root class + radius).
- [x] The consumer fixture styles the kit itself; CI also builds Storybook.

## Notes

- Fixed while rewriting, caught by a test: the headless `AppButton` had forced `type="button"` over a caller's `type="submit"`.
- Visually checked in a real browser: radius presets and custom values, the skinned signup form in dark mode with RTL, the RTL select (its chevron was rotating with `dir` and now uses physical borders on purpose), headless output with browser defaults, and both guide pages.
