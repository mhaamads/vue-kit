# 03: Remaining utils and generic types

**What to build:** An app developer gets the everyday helpers from `./utils` with no extra dependencies: dates, colours, images, a typed event bus that cleans up after itself, small helpers and the shared generic types.

**Blocked by:** 01 (Scaffold tracer).

**Status:** ready-for-agent

- [ ] Date helpers: local ISO string, month shift, calendar range, UTC midnight, and add/subtract days and months on native `Date` (no luxon). Same results as portal-iq-vue, including month-end clamping.
- [ ] Colour helpers: hex ↔ HSL, lighten by percentage, and a colour readable for a given theme.
- [ ] Image helpers: normalise a URL, and a broken-image placeholder.
- [ ] Event bus: `broadcastEvent`, `useGlobalEvent`, `useGlobalEventRef`, `waitForEvent`. A test shows the listener is removed when the component unmounts.
- [ ] Helpers: deep clone, clipboard copy, ordinal suffix, time-string parse and format, invert object, string → number.
- [ ] Generic types exported: HTTP options and error shapes, z-index scale, file-type helpers (image, video, previewable).
- [ ] Nothing app-specific comes along: no message bridge, DevExtreme filter utils or app types.
