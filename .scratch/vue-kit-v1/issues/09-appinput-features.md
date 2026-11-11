# 09: `AppInput` full feature set

**What to build:** Every free-text field that portal-iq-vue supports works with `AppInput`: masked, filtered and capitalised text, numbers, passwords, growing textareas, copyable values and international phone numbers. They behave the same in the default UI and in custom UIs.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] `mask` (maska options), `acceptOnly` (numbers / letters / alphanumeric) and `capitalize` (first / each) give the same output as portal-iq-vue, on input and on focus. The model holds the masked string.
- [ ] `type="number"` gives a number in `v-model`.
- [ ] The password toggle switches the type. `toggleProps` carries `aria-pressed`, `aria-controls` and an `aria-label` from `messages`.
- [ ] `as="textarea"` grows with its content.
- [ ] `copyable` / `copyValue` show a copy button that copies the value.
- [ ] `type="tel"` with `v-model:code` shows the country-code picker. The Chrome focused-input re-render fix is kept.
- [ ] `displayValue` overrides the shown value.
- [ ] Every case runs on all three contract UIs.
