# 09: `AppInput` full feature set

**What to build:** Every free-text field that portal-iq-vue supports works with `AppInput`: masked, filtered and capitalised text, numbers, passwords, growing textareas, copyable values and international phone numbers. They behave the same in the default UI and in custom UIs.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] `mask` (maska options), `acceptOnly` (numbers / letters / alphanumeric) and `capitalize` (first / each) give the same output as portal-iq-vue, on input and on focus. The model holds the masked string.
- [x] `type="number"` gives a number in `v-model`.
- [x] The password toggle switches the type. `toggleProps` carries `aria-pressed`, `aria-controls` and an `aria-label` from `messages`.
- [x] `as="textarea"` grows with its content.
- [x] `copyable` / `copyValue` show a copy button that copies the value.
- [x] `type="tel"` with `v-model:code` shows the country-code picker. The Chrome focused-input re-render fix is kept.
- [x] `displayValue` overrides the shown value.
- [x] Every case runs on all three contract UIs.

## Notes (resolved 2026-11-12)

- All behaviour lives in `useTextInput`. Custom UIs get it by binding `inputProps`, `toggleProps` (password), `copyProps` and `codeProps` (dial-code `<select>`). The minimal override in the harness does exactly that, and all 44 feature cases pass on the three UIs.
- Masks use `maska`'s `Mask.masked()` on input and for display; the model holds the masked text, as in portal. Marked `shortcut:`: when a filter or mask changes the text, the caret jumps to the end. That's fine for the typed-at-the-end masks portal uses; switch to maska's `MaskInput` if mid-text editing matters.
- `acceptOnly="letters"` / `"alphanumeric"` stay ASCII-only (portal parity: passport names are Latin), so they strip Arabic and Kurdish letters. Revisit if a form needs local-script names.
- The dial-code picker is a native `<select>` (portal's custom dropdown had `tabindex="-1"` items, so it couldn't be reached by keyboard). Labels are `IQ +964`, with the country name as a tooltip (found in review: longer labels clipped in the 80 px box). The country data is cut to 4 fields: 260 lines instead of 2,617.
- No default dial code. Portal defaulted to `+964`, which is app-specific: pass `v-model:code` with a starting value.
- Renamed vs portal (no consumers yet): `hasCopy` → `copyable`, `tag` → `as`; `classList` / `labelClassList` → `class` / the `label` slot.
