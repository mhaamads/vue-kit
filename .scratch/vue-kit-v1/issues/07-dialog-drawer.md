# 07: Dialog, Drawer and overlay heading

**What to build:** An app developer opens `AppDialog` or `AppDrawer` with `v-model`. The overlay renders above everything, closes on Escape or a backdrop click, keeps keyboard focus inside, and screen readers announce it by its heading.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** resolved

- [x] Prefer the native `<dialog>` + `showModal()` (as `AppConfirmDialog` in ticket 05 does): focus trap, Escape and top-layer stacking come from the browser, so no teleport or z-index is needed.
- [x] Both teleport to the body and take `v-model` for open state. Escape closing and backdrop closing can each be turned off.
- [x] Focus moves into the overlay on open, Tab stays inside, and focus returns to the trigger on close.
- [x] `role="dialog"`, `aria-modal="true"` and `aria-labelledby` point at `AppOverlayHeading`. The close button's label comes from `messages`.
- [x] The drawer opens from the end side, so it mirrors under `dir: 'rtl'`.
- [x] Sizes and options match portal-iq-vue's overlays. Styling uses the theme tokens.

## Notes (resolved 2026-11-11)

- All three overlays (`AppDialog`, `AppDrawer`, `AppConfirmDialog`) share one composable, `useModalDialog`, on the native `<dialog>` + `showModal()`. There's no teleport and no z-index, because the dialog renders in the browser's top layer. The review moved `AppConfirmDialog` from its own copy onto this composable.
- Fixed in review, with a test that fails on the old code: focus is returned to the trigger only *after* `close()`. While a modal is open, everything outside it is inert, so an earlier `focus()` was silently ignored in browsers.
- API changes vs portal (no consumers yet): `persistent` → `closeOnEscape` / `closeOnBackdrop` (each can be turned off); `zIndex` and `classList` removed (the top layer needs no z-index, and `class` passes through); the drawer's unused `backUrl` / `ingoreOverflowHidden` are dropped. The heading's back button now has an `aria-label` from `messages.close` and flips in RTL; the sticky corner is the logical `rounded-ss-3xl` (the RTL guard now also catches `rounded-tl/tr/bl/br`).
- Animations use CSS `@starting-style` (Tailwind's `starting:`) for enter. The content unmounts on close, so there is no exit animation (portal faded out).
- Not done: body scroll lock. Portal's `useOverlay` locked it for dialogs only. Add `html:has(dialog[open]:modal) { overflow: hidden }` to `theme.css` if wanted.
