# 03: Remaining utils and generic types

**What to build:** An app developer gets the everyday helpers from `./utils` with no extra dependencies: dates, colours, images, a typed event bus that cleans up after itself, small helpers and the shared generic types.

**Blocked by:** 01 (Scaffold tracer).

**Status:** resolved

- [x] Date helpers: local ISO string, month shift, calendar range, UTC midnight, and add/subtract days and months on native `Date` (no luxon). Same results as portal-iq-vue, including month-end clamping.
- [x] Colour helpers: hex ↔ HSL, lighten by percentage, and a colour readable for a given theme.
- [x] Image helpers: normalise a URL, and a broken-image placeholder.
- [x] Event bus: `broadcastEvent`, `useGlobalEvent`, `useGlobalEventRef`, `waitForEvent`. A test shows the listener is removed when the component unmounts.
- [x] Helpers: deep clone, clipboard copy, ordinal suffix, time-string parse and format, invert object, string → number.
- [x] File-type helpers exported (image, video MIME, playable, previewable). **Moved:** the HTTP option and error types go to ticket 06, because their shape depends on `createHttpClient`. The z-index scale goes to ticket 04, because its class names only work with `theme.css`.
- [x] Nothing app-specific comes along: no message bridge, DevExtreme filter utils or app types.

## Notes (resolved 2026-11-11)

- Renamed for clarity (vue-kit has no consumers yet): `lightenHexByPercentage` → `hexWithOpacity` (it appends an alpha byte), `getOrdinalSuffix(index)` → `ordinalSuffix(n)` (takes the number itself), `convertStringToNumber` → `toNumber`. `DateBuilder` is replaced by `shiftDate(date, { years, months, days })`.
- Fixed portal bugs, each pinned by a test: ordinals from 21 up ("21th" → "21st"); `toNumber(0)` gave `undefined`; `parseTimeString("09:30")` gave NaN; `useGlobalEventRef` never removed its listener; `deepClone(undefined)` threw.
- Event bus: listeners now clean up in any effect scope, not only in components. `useGlobalEvent` always returns its unsubscribe function, so the `manual` option is gone. `globalEvents` keeps `consumeLastPayload` (portal's TaskForm prefill hand-off) but drops `emit` / `on` / `once` (use `broadcastEvent`, `useGlobalEvent`, `waitForEvent`).
- Not ported (YAGNI, or out by ADR-0010): `sleep`, `isInViewport`, `stripHtmlTags`, `previewImage` (needs the lightbox), `extIcons` and `getAttachmentFileStyle` (wait for attachments, v1.x).
- Parity: 35 of 36 date and colour tests also pass against portal's real code. `shiftDate` is checked against luxon's `DateBuilder`. The 36th test is `toLocalISOString`, which lives only in portal page components.
