# 08: `useField`, basic `AppInput` and the contract harness

**What to build:** An app developer uses `<AppInput v-model label hint errors>` and gets a correctly linked, accessible text field. They can replace any part of it, or all of it, at the four override levels without losing behaviour. Maintainers get the three-UI contract harness that every later input reuses.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** ready-for-agent

- [ ] `useField` is exported and returns plain refs: `id` (optional; `useId()` fallback), `value`, `setValue`, `errors`, `error`, `invalid`, `touched`, `dirty`, `reset`, `disabled`, `readonly`, `required`, `labelProps`, `hintProps`, `errorProps`, `controlAria`, `onBlur`.
- [ ] The label's `for` matches the control's `id`. `aria-describedby` lists the hint and error ids that exist. `aria-invalid="true"` appears only when there are errors. The error has `role="alert"`.
- [ ] `useTextInput` + `AppInput` for plain text: `inputProps`, the `label` / `prefix` / `suffix` / `hint` / `error` part slots, and a default slot that receives the whole API.
- [ ] `inheritAttrs: false`: class, style, native attributes and listeners land only on the control. Regression: `@keydown.enter` fires exactly once. `root-class` styles the wrapper.
- [ ] Global override: with `components: { Input: MyInput }` registered, `AppInput` renders `MyInput` with one typed `field` prop and passes its slots through. The composable still runs inside `AppInput`.
- [ ] Contract harness: a `describe.each` over the default UI, a minimal slot override and a minimal plugin override. Every `AppInput` case passes on all three.
- [ ] `AppInput`, `useTextInput`, the default skin and the types are exported from `./ui`. The smoke fixture mounts `AppInput` from the installed package.
