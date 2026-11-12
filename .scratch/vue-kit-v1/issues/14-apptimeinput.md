# 14: `AppTimeInput`

**What to build:** An app developer collects a time as `{ hours, minutes }` with `AppTimeInput`. It supports 12/24-hour display, a minute step, limits and presets, and behaves like portal-iq-vue's time input.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] `format` 12 / 24 (with AM/PM in 12-hour mode), `minuteStep`, `minTime` / `maxTime` (out-of-range options cannot be picked), presets, clearable.
- [x] Hour and minute columns are keyboard-operable and labelled for screen readers.
- [x] Same model shape and edge cases as portal-iq-vue (midnight, noon, step rounding).
- [x] All three contract UIs pass, and the `TimeInput` global override key works.

## Notes (resolved 2026-11-12)

- Custom columns (not `<input type="time">`), because a native time input shows 12/24 h by OS locale and can't honour `format`. There's no picker library (portal's `FloatingBox` is not in v1): the panel is positioned under the trigger, and it closes on Escape or when focus leaves the component (`rootProps.onFocusout`), with no document listener.
- Fixed vs portal: `minTime` / `maxTime` disable out-of-range hours, minutes and AM/PM, and results are clamped (portal only filtered presets; its `clampAndSet` never clamped). "Now" only shows when the current time is allowed.
- Columns are `role="radiogroup"` with `role="radio"` buttons, roving tabindex, and ↑ / ↓ that skip disabled options and wrap.
- Escape and OK return focus to the trigger (found in review; the panel's buttons disappear with it, so focus fell to `<body>`). Tests fail without the fix.
- Kept: the `{ hours, minutes }` model (also reads `"HH:mm"` / `"HHmm"`), "no value yet" counts as AM, presets, Now, OK and clear; `clearable` defaults to true via `withDefaults`.
- Dropped: `rounded`, `classList` / `labelClassList`.
