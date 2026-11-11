# 05: Toasts and confirm

**What to build:** An app developer mounts `AppToasts` and `AppConfirmDialog` once. They call `useToast(...)` from anywhere, including plain modules, and `await useConfirm(...)` for yes/no decisions. Users hear the toasts and can dismiss them by keyboard. Message text is never run as HTML.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** ready-for-agent

- [ ] The toast queue is module-level reactive state, with no Pinia. `useToast` works outside component setup.
- [ ] Toast options: type, message (`string | string[]`, an array renders as a list), duration, persistent, action with actionLabel. There is no route option.
- [ ] `AppToasts` is a polite live region. Each toast has a keyboard-reachable dismiss button.
- [ ] Regression: a message such as `<img src=x onerror=alert(1)>` renders as visible text and runs nothing.
- [ ] `useConfirm(message, options)` resolves `true` or `false`. It supports title, type, labels and variants, and an optional typed-confirmation text.
- [ ] `AppConfirmDialog` keeps focus inside, cancels on Escape, and takes its labels from `messages`.
