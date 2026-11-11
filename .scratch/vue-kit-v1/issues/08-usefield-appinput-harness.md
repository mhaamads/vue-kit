# 08: `useField`, basic `AppInput` and the contract harness

**What to build:** An app developer uses `<AppInput v-model label hint errors>` and gets a correctly linked, accessible text field. They can replace any part of it, or all of it, at the four override levels without losing behaviour. Maintainers get the three-UI contract harness that every later input reuses.

**Blocked by:** 04 (Plugin, theme and first primitives).

**Status:** resolved

- [x] `useField` is exported and returns plain refs: `id` (optional; `useId()` fallback), `value`, `setValue`, `errors`, `error`, `invalid`, `touched`, `dirty`, `reset`, `disabled`, `readonly`, `required`, `labelProps`, `hintProps`, `errorProps`, `controlAria`, `onBlur`.
- [x] The label's `for` matches the control's `id`. `aria-describedby` lists the hint and error ids that exist. `aria-invalid="true"` appears only when there are errors. The error has `role="alert"`.
- [x] `useTextInput` + `AppInput` for plain text: `inputProps`, the `label` / `prefix` / `suffix` / `hint` / `error` part slots, and a default slot that receives the whole API.
- [x] `inheritAttrs: false`: class, style, native attributes and listeners land only on the control. Regression: `@keydown.enter` fires exactly once. `root-class` styles the wrapper.
- [x] Global override: with `components: { Input: MyInput }` registered, `AppInput` renders `MyInput` with one typed `field` prop and passes its slots through. The composable still runs inside `AppInput`.
- [x] Contract harness: a `describe.each` over the default UI, a minimal slot override and a minimal plugin override. Every `AppInput` case passes on all three.
- [x] `AppInput`, `useTextInput`, the default skin and the types are exported from `./ui`. The smoke fixture mounts `AppInput` from the installed package.

## Notes (resolved 2026-11-11)

- Slots and overrides receive `field` = `reactive(useTextInput(...))`: refs are unwrapped (`field.inputProps`, not `.value`). The design doc's level-4 example is updated to match.
- Order: the instance's default slot (level 3) wins over an app-wide override (level 4), which wins over the default skin (found in review).
- `inputProps` is `mergeProps(attrs, aria, own)`: the caller's class, native attrs and listeners merge onto the control, `onBlur` / `onInput` chain with the caller's, and the caller's `aria-describedby` is kept (found in review). Because attrs aren't reactive, a counter bumped in `onBeforeUpdate` keeps `inputProps` current.
- `required` sets `aria-required` only, not the native `required`, so browser validation popups don't block `<AppForm>`'s own submit handling.
- `reset(value)` rebaselines `dirty` for forms that load their data after mount (found in review).
- The harness is proven: moving `aria-invalid` from the composable into the skin template makes exactly the slot-override and plugin-override cases fail.
- No HTML comments at the template root: in dev builds they turn the template into a multi-root fragment.
