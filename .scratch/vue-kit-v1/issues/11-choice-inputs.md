# 11: Choice inputs

**What to build:** An app developer uses `AppCheckbox`, `AppCheckboxGroup`, `AppRadioGroup` and `AppSwitch` with `v-model`. They behave like native form controls (keyboard, labels, groups) and can be overridden like `AppInput`.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] `useChoice` + `AppCheckbox`: value, description, disabled. `AppSwitch` adds `role="switch"`, custom true/false values and the two-label option style.
- [ ] `useChoiceGroup` + `AppRadioGroup` / `AppCheckboxGroup`: options, horizontal or vertical layout, `selectFirstOption`, `allowSelectionRemoval`, `groupProps` (`radiogroup` / `group` + `aria-labelledby`) and `itemProps`.
- [ ] Arrow-key movement in radio groups comes from native radios. No custom key handling.
- [ ] Errors and ARIA as in `useField`. All three contract UIs pass, and global override keys work.
