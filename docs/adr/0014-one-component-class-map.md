# 0014. One component per field, styled with a `ui` class map

Status: Accepted (2026-11-12). Supersedes ADR-0013. Amends ADR-0012 (styling hooks).

## Context

ADR-0013 split every component into a Root plus many unstyled parts. In review the owner found it over-engineered and too much to take in: a single field needed five or more imports and tags. They chose one component per field with a class map instead.

## Decision

- One component per field (`AppInput`, `AppSelect`, `AppCheckbox`, `AppSwitch`, `AppRadioGroup`, `AppCheckboxGroup`, `AppDateInput`, `AppTimeInput`, `AppDialog`, `AppToasts`, `AppConfirmDialog`), working from props alone (`label`, `hint`, `errors`, …).
- No CSS in the package. Every rendered piece takes its class from a `ui` map: `:ui="{ trigger: '…' }"` on one component, or `createVueKit({ ui: { select: { trigger: '…' } } })` once for the app. The component's own key replaces the app-wide one (no merging inside a key, so no class-merge library is needed).
- Removed compared with ADR-0012: `rootClass` (now `ui.root`), part slots, the full-markup default slot, `*Skin` components and `createVueKit({ components })`. Kept slots: `prefix` / `suffix` (AppInput), `option` (AppSelect), default and `footer` (AppDialog).
- `AppDrawer` and `AppOverlayHeading` are folded into `AppDialog` (`title`, `closeable`, `position: center | start | end`).
- Composables stay public for fully custom markup.
- The docs' example skin is two files: `skin.css` (colour, radius and font tokens as CSS variables) and `ui.ts` (the class map passed to `createVueKit`).

## Consequences

- One tag per field, one place to theme. The tests guard that templates take classes only from `ui.*`.
- Apps that need markup the component doesn't render use the composable.

## Amendment (2026-11-12): docs site instead of Storybook

The owner found Storybook too complicated. The docs are a VitePress site (`site/`, `npm run docs`): one short page per component with a live example, the code, a props table and its style keys. CI builds it (`npm run docs:build`) instead of Storybook.

## Amendment (2026-11-12): content slots

So apps rarely need the composables, every input has `label`, `hint` and `errors` slots (a hint given only by its slot still describes the control), plus `description` (checkbox), `item` (groups), `chip` / `empty` (select), `title` (dialog) and `message` (toasts). The docs' "Your own HTML" page became a short "Still not enough?" note on the Customize page.

## Amendment (2026-11-12): opt-in options

Chosen by the owner from a Quasar comparison, all off unless passed: `AppInput` `clearable`, `counter`, `debounce`, `loading`, `rules` (checks the field on its own: on leaving, then on change; `validate()` exposed); `AppSelect` `max-values`; `AppForm` `validate-on="blur"`, `warn-unsaved`, and an exposed `resetValidation()` / `dirty`. New `AppPinInput` (`length`): one real hidden input under the boxes, so paste, SMS auto-fill, backspace and screen readers work natively; no `maxlength`, because the browser would cut pasted text before it is cleaned.
