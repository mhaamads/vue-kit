# 10: `AppForm`

**What to build:** An app developer wraps fields in `<AppForm :form-data :schema @submit>`. A failed submit shows the errors on the fields and puts the user on the first invalid control. A valid submit emits `submit`.

**Blocked by:** 02 (Validation), 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] Same API as portal-iq-vue's form: `formData`, `schema`, `submit` event, a default slot with `{ errors }`, and an exposed `validate()`.
- [x] A failed submit focuses the first `[aria-invalid="true"]` control and scrolls it into view. This works for default and custom UIs alike.
- [x] Empty required fields are not marked invalid before the first submit.
- [x] `devBypassValidation()` from the plugin skips validation when it returns true, and warns in dev.
- [x] Validation messages come from the plugin `messages`.

## Notes (resolved 2026-11-12)

- Finds the first error by `[aria-invalid="true"]` instead of portal's `[data-form-error]` → parent → selector lookup, so it works for any UI that binds `inputProps` (tested with a fully custom slot UI).
- `novalidate` on the `<form>`: browser validation popups never get in the way, and the kit's fields set `aria-required`, not `required`.
- Kept from portal: errors are computed only on submit, and a field's error stays visible until the next submit even after the user fixes the value. Possible follow-up: re-check a field when it changes after the first submit.
- Dropped: portal's dev-tools "log errors on submit" (read `errors` from the slot or `ref` instead). The `class` prop is gone because `class` falls through to `<form>`.
- The consumer fixture mounts the generic `AppForm` from the installed package, which proves its generated types.
