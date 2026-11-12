# 11: Choice inputs

**What to build:** An app developer uses `AppCheckbox`, `AppCheckboxGroup`, `AppRadioGroup` and `AppSwitch` with `v-model`. They behave like native form controls (keyboard, labels, groups) and can be overridden like `AppInput`.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] `useChoice` + `AppCheckbox`: value, description, disabled. `AppSwitch` adds `role="switch"`, custom true/false values and the two-label option style.
- [x] `useChoiceGroup` + `AppRadioGroup` / `AppCheckboxGroup`: options, horizontal or vertical layout, `selectFirstOption`, `allowSelectionRemoval`, `groupProps` (`radiogroup` / `group` + `aria-labelledby`) and `itemProps`.
- [x] Arrow-key movement in radio groups comes from native radios. No custom key handling.
- [x] Errors and ARIA as in `useField`. All three contract UIs pass, and global override keys work.

## Notes (resolved 2026-11-12)

- All four are native inputs (portal used `div` / `button` elements with `role` and hand-written key handlers). Space, Tab and the arrow keys between radios come from the browser. Radios share one `name` per group.
- Selection runs on `change`, which every browser fires for click, Space and arrow keys. `click` only handles "click the selected radio to clear it", which fires no `change` (found in review; the test fails on a click-only handler).
- Kept from portal: `AppCheckbox` value mode (`value` when checked, `undefined` when not); `AppRadioGroup` picks the first option when empty (`selectFirstOption`, default true) and supports `allowSelectionRemoval`; `AppSwitch` settles an unknown starting value to "off" and keeps the two-label pill look, now over one checkbox with `role="switch"`; option matching is loose (`'2'` selects `2`).
- Group label: `aria-labelledby` (a group has no single control to put `for` on). `aria-invalid` is on the group and on every item, so `AppForm` can focus one.
- Dropped (no consumers yet): `labelConfig` / `labelClassList`. The switch's `options` (two `{ label, value }`) become `trueValue` / `falseValue` + `onLabel` / `offLabel`; the default labels come from `messages.on` / `off`.
- `FieldFeedback.vue` now renders the hint and error list for every input skin, including `AppInputSkin`.
- The harness queues `v-model` updates that inputs emit during mount (switch settling, first radio).
