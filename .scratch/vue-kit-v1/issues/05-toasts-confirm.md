# 05: Toasts and confirm

**What to build:** An app developer mounts `AppToasts` and `AppConfirmDialog` once. They call `useToast(...)` from anywhere, including plain modules, and `await useConfirm(...)` for yes/no decisions. Users hear the toasts and can dismiss them by keyboard. Message text is never run as HTML.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** resolved

- [x] The toast queue is module-level reactive state, with no Pinia. `useToast` works outside component setup.
- [x] Toast options: type, message (`string | string[]`, an array renders as a list), duration, persistent, action with actionLabel. There is no route option.
- [x] `AppToasts` is a polite live region. Each toast has a keyboard-reachable dismiss button.
- [x] Regression: a message such as `<img src=x onerror=alert(1)>` renders as visible text and runs nothing.
- [x] `useConfirm(message, options)` resolves `true` or `false`. It supports title, type, labels and variants, and an optional typed-confirmation text.
- [x] `AppConfirmDialog` keeps focus inside, cancels on Escape, and takes its labels from `messages`.

## Notes (resolved 2026-11-11)

- `AppConfirmDialog` is built on the native `<dialog>` + `showModal()`, not on `AppDialog` / `AppInput`. Those are tickets 07 and 08, which this ticket doesn't depend on. The browser provides the focus trap, Escape (`cancel` event) and top-layer stacking. The kit focuses Cancel itself, because browsers differ on what gets focus.
- Kept from portal: newest two toasts only, 3 s default, at least 10 s for errors, persistent, a Copy button on errors, and the action button.
- Fixed vs portal, each with a test: text instead of `v-html` (XSS); a second `useConfirm` now resolves the first with `false` (it used to hang forever); ids come from a counter because `crypto.randomUUID` crashes outside HTTPS; action toasts always get a keyboard button (default label "Open"); the toast stack is centred with `inset-x-0 mx-auto`, which works in RTL (portal's `start-1/2 -translate-x-1/2` sat off-centre in RTL).
- Dropped (YAGNI): the `to` route option (use `action`), `clickCallback`, `priority`, the confirm buttons' `onClick` callbacks (use the promise result), and the copyable confirm phrase.
