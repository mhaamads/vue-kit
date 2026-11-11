# 10: `AppForm`

**What to build:** An app developer wraps fields in `<AppForm :form-data :schema @submit>`. A failed submit shows the errors on the fields and puts the user on the first invalid control. A valid submit emits `submit`.

**Blocked by:** 02 (Validation), 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] Same API as portal-iq-vue's form: `formData`, `schema`, `submit` event, a default slot with `{ errors }`, and an exposed `validate()`.
- [ ] A failed submit focuses the first `[aria-invalid="true"]` control and scrolls it into view. This works for default and custom UIs alike.
- [ ] Empty required fields are not marked invalid before the first submit.
- [ ] `devBypassValidation()` from the plugin skips validation when it returns true, and warns in dev.
- [ ] Validation messages come from the plugin `messages`.
