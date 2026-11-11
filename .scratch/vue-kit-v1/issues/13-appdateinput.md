# 13: `AppDateInput` (native)

**What to build:** An app developer collects dates, date-times, months, weeks or date ranges with `AppDateInput`, using the browser's own picker and no date-picker library. Allowed or disallowed date rules are still enforced and reported through `errors`.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] Modes: date, datetime (`datetime-local`), month, week. The model accepts a `Date` or a string and returns the same shape as portal-iq-vue's date input.
- [ ] Range mode: start and end controls. The end's `min` follows the start, and the start's `max` follows the end.
- [ ] `minDate` / `maxDate` map to native `min` / `max`. `clearable` clears. Required, disabled and readonly work.
- [ ] `allowedDates` / `disabledDates`: an invalid pick is rejected and an error from `messages` is shown through `errors`.
- [ ] The default skin sets `color-scheme` from `[data-theme]` so the native picker matches dark mode.
- [ ] All three contract UIs pass, and the `DateInput` global override key works.
