# 0013. Compound parts: every component is a Root plus unstyled parts

Status: Superseded by ADR-0014 (2026-11-12): found over-engineered in review. Kept for the record. Amends ADR-0012 (styling hooks) and replaces the four override levels in `docs/shared-package/03-input-design.md`.

## Context

After ADR-0012 the package rendered no styles, but customising it still meant a mix of mechanisms: `rootClass`, `class` forwarded to the control, part slots, a full-markup default slot, exported `*Skin` components and app-wide overrides through `createVueKit({ components })`. Each component had a different set of them. The Storybook example skin still carried portal-iq-vue's look (the portal's colours, Poppins). The owner asked to remove the portal look completely and to give apps full control over the UI in the cleanest way possible, and chose compound parts (the Reka UI / Radix pattern) over a `ui` class-map prop or composables only.

## Decision

- Every component is a **Root** (owns `v-model`, props and behaviour; renders one element with `data-*` state) plus **parts**. Each part renders one element with the kit's ids, ARIA and `data-*` attributes and nothing else. Apps arrange the parts in any markup.
- One mechanism for all parts: `definePart(name, injectionKey, spec)` in `src/ui/part.ts`. A part injects its Root's reactive state, merges the caller's attrs over its own (class / style / native attributes land on the element, listeners chain, `aria-describedby` is joined), supports `as` (another tag or a component), and its default slot replaces its default content and receives the Root state. Parts that only apply sometimes render nothing (`bind` returns `false`).
- ARIA follows what is rendered: `useField` keeps a registry (`register` / `has`) for label, hint and description, so `aria-describedby` / `aria-labelledby` point only at parts that exist. The attribute updates one tick after the part mounts.
- `FieldLabel`, `FieldHint`, `FieldDescription` and `FieldErrors` are shared by every input Root (they inject a common field context).
- Text that is only presentation is no longer a prop: `label`, `hint`, `description`, `placeholder` on text fields, `copyable` (the part's presence), `as="textarea"` (on `TextFieldInput`), chip limits, `direction`, `rootClass`, `optionHeight` (now on `SelectListbox`).
- Removed: the `App*` components, `AppInputSkin`, `AppSelectSkin`, `FieldFeedback`, part slots, `createVueKit({ components })` / `OverridableInput`, `AppDrawer` (a drawer is `DialogRoot` with drawer CSS) and `AppOverlayHeading` (replaced by `DialogTitle` / `DialogClose`). `AppForm` → `Form`, `AppButton` → `Button` (`tag` → `as`).
- Composables stay public and unchanged in behaviour; they are the escape hatch for markup the parts can't express.
- The Storybook example skin is a neutral design system built only on the parts, with every visual decision as a CSS variable (`--vk-accent`, `--vk-radius`, surfaces, text, font; dark mode swaps variables). No portal colours or fonts remain.

## Consequences

- One rule to learn: put classes on the part you want to style. An app's design system is a set of small wrapper components (`UiInput`, `UiSelect`, …) written once; the docs ship a full set to copy.
- More imports per screen than a single `<AppInput label="…">`. Apps hide this inside their wrappers.
- `ToastViewport` and `ConfirmDialogRoot` still work with no children; `SelectContent`, `RadioGroupList` and `TimeFieldColumn` render default children, so the common case stays short.
- Tests run each behaviour once against a full composition (`tests/ui/contract.ts`) instead of three times against three override levels.
- Breaking for every UI import. The package is unreleased (0.0.0), so no migration path is kept.
