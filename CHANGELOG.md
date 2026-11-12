# Changelog

All notable changes. Versions follow [SemVer](https://semver.org) (ADR-0009).

## Unreleased

- The `frontend-conventions` AI coding skill lives in this repo (`skills/`). Install it from GitHub
  with `npx skills add mhaamads/vue-kit --skill frontend-conventions` (docs page _AI coding skill_).

## 0.1.0 (2026-11-12)

First version.

### UI (`/ui`)

- Inputs: `AppInput` (masks, number, password, copy, phone with searchable country code, textarea,
  `clearable`, `counter`, `debounce`, `loading`, `rules`), `AppSelect` (search, multiple with
  chips, `max-values`, lazy options, 5,000+ options), `AppCheckbox`, `AppSwitch`, `AppRadioGroup`,
  `AppCheckboxGroup`, `AppDateInput` (on `@vuepic/vue-datepicker`), `AppTimeInput`, `AppPinInput`.
- `AppForm`: schema validation on submit or on blur, `resetValidation()`, `warn-unsaved`.
- `AppButton` with app-wide variants; `AppDialog` (dialogs and drawers, scroll lock);
  `AppToasts` (shown above open dialogs) and `AppConfirmDialog` with `useToast()` / `useConfirm()`.
- No CSS: every piece takes classes from a `ui` map, app-wide in `createVueKit({ ui })` or per
  component. Content slots for labels, hints, errors and every built-in button.
- Languages: English built in, add more and switch at runtime (direction, calendar language,
  AM/PM). Accessible: labelled fields, keyboard support, a dev warning for unlabelled fields.
- Works with Nuxt / server rendering.

### Utilities (`/utils`)

- `defineSchema` / `validate` (incl. `accepted`), date formatting, colours, files, images, event bus.

### HTTP (`/http`)

- `createHttpClient`: auth headers, error and success toasts, `onError` retry, `signal` (cancel),
  `timeout`, messages that follow the app language.
