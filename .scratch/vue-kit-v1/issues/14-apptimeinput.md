# 14: `AppTimeInput`

**What to build:** An app developer collects a time as `{ hours, minutes }` with `AppTimeInput`. It supports 12/24-hour display, a minute step, limits and presets, and behaves like portal-iq-vue's time input.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] `format` 12 / 24 (with AM/PM in 12-hour mode), `minuteStep`, `minTime` / `maxTime` (out-of-range options cannot be picked), presets, clearable.
- [ ] Hour and minute columns are keyboard-operable and labelled for screen readers.
- [ ] Same model shape and edge cases as portal-iq-vue (midnight, noon, step rounding).
- [ ] All three contract UIs pass, and the `TimeInput` global override key works.
