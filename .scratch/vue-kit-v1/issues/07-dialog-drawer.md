# 07: Dialog, Drawer and overlay heading

**What to build:** An app developer opens `AppDialog` or `AppDrawer` with `v-model`. The overlay renders above everything, closes on Escape or a backdrop click, keeps keyboard focus inside, and screen readers announce it by its heading.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** ready-for-agent

- [ ] Both teleport to the body and take `v-model` for open state. Escape closing and backdrop closing can each be turned off.
- [ ] Focus moves into the overlay on open, Tab stays inside, and focus returns to the trigger on close.
- [ ] `role="dialog"`, `aria-modal="true"` and `aria-labelledby` point at `AppOverlayHeading`. The close button's label comes from `messages`.
- [ ] The drawer opens from the end side, so it mirrors under `dir: 'rtl'`.
- [ ] Sizes and options match portal-iq-vue's overlays. Styling uses the theme tokens.
