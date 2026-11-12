# 13: `AppDateInput` (native)

**What to build:** An app developer collects dates, date-times, months, weeks or date ranges with `AppDateInput`, using the browser's own picker and no date-picker library. Allowed or disallowed date rules are still enforced and reported through `errors`.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] Modes: date, datetime (`datetime-local`), month, week. The model accepts a `Date` or a string and returns the same shape as portal-iq-vue's date input.
- [x] Range mode: start and end controls. The end's `min` follows the start, and the start's `max` follows the end.
- [x] `minDate` / `maxDate` map to native `min` / `max`. `clearable` clears. Required, disabled and readonly work.
- [x] `allowedDates` / `disabledDates`: an invalid pick is rejected and an error from `messages` is shown through `errors`.
- [x] The default skin sets `color-scheme` from `[data-theme]` so the native picker matches dark mode.
- [x] All three contract UIs pass, and the `DateInput` global override key works.

## Notes (resolved 2026-11-12)

- Native inputs only (ADR-0010). Models keep portal's vue-datepicker shapes: `Date` (date, datetime), `{ month, year }` with a 0-based month, `[monday, sunday]` (ISO 8601 weeks, tested across New Year: 2026-W01 starts Mon 29 Dec 2025; 1 Jan 2027 is in 2026-W53), and `[start, end]` for ranges. String and number models are accepted; `YYYY-MM-DD` is read as a local day, never UTC midnight.
- Enforced by rejecting the pick (the model is kept, the input is reset, and an error from `messages.dateNotAllowed` is shown): disabled / allowed dates, and, found in review, typed dates outside `minDate` / `maxDate` or on the wrong side of the other range end. Native `min` / `max` only limit the picker. The error clears when the model changes from outside.
- `clearable` defaults to true via `withDefaults`: Vue casts a missing boolean prop to `false`, so a default inside the composable never applied (caught by the tests).
- The browser's picker follows dark mode through `scheme-light dark:scheme-dark` (color-scheme), checked in the consumer build.
- Dropped with the picker library (design doc): `inline`, `multiCalendars`, `quarterPicker` / `yearPicker`, `multiDates`, `timezone`, `textInput`, `timeConfig`, `disabledTimes`, `preventMinMaxNavigation`, `autoApply`, `rangePosition`, and the `trigger` / `action-row` slots. Range works in date and datetime modes only.
- The default slot binds a typed alias (`slotProps`) because binding `field` directly in this template trips a vue-tsc inference quirk (bisected: it needs the full template). Same object, no runtime difference.
