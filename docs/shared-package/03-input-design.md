# 03 — Input system design (`@moonlinetravel/vue-kit/ui`)

Phase 4. Status: **approved 2026-11-11, with ADR-0010:** no heavy UI libraries. Follows ADR-0001 to ADR-0010 in [docs/adr/](../adr/) and items A4, A5, I3, I4, R4 in [02-research.md](02-research.md).

Runtime dependencies of `./ui`: `vue` (peer), `maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`. Nothing else. A contract test fails the build if `./ui` imports any other package (`devextreme`, `@vuepic/*`, `@tiptap/*`, `vue3-colorpicker`, `vue-easy-lightbox`).

## Rule

All behaviour lives in a composable. Components are skins. A template may bind props and call slot functions. It may not contain logic: no normalising, masking, id building or ARIA decisions.

```
useField()                         ids, model, errors, touched/dirty, disabled/readonly, ARIA
 ├─ useTextInput()   → <AppInput>      text, password, email, tel, number, textarea (as="textarea")
 ├─ useSelect()      → <AppSelect>     single / multiple, search, keyboard, listbox ARIA
 ├─ useChoice()      → <AppCheckbox>, <AppSwitch>   (native checkbox; switch adds role="switch")
 ├─ useChoiceGroup() → <AppRadioGroup>, <AppCheckboxGroup>  (native radios/checkboxes)
 ├─ useDateInput()   → <AppDateInput>  model normalising; default skin = native <input type="date|datetime-local|month|week">
 └─ useTimeInput()   → <AppTimeInput>  hours/minutes model, min/max, step, 12/24 h
<AppForm>   validate on submit → errors via slot → focus first [aria-invalid="true"]
```

v1.x (not in ADR-0005): `useFileInput` / `<AppFileUpload>`, and `<AppColorInput>` on native `<input type="color">`. A rich-text editor is out (ADR-0010: Tiptap).

## 1. `useField` — shared by every input

```ts
import type { MaybeRefOrGetter, Ref, ComputedRef } from 'vue'

type UseFieldOptions<T> = {
  model: Ref<T>                                  // the component's defineModel()
  id?: MaybeRefOrGetter<string | undefined>      // falls back to useId()
  errors?: MaybeRefOrGetter<string[] | undefined>
  required?: MaybeRefOrGetter<boolean | undefined>
  disabled?: MaybeRefOrGetter<boolean | undefined>
  readonly?: MaybeRefOrGetter<boolean | undefined>
  hasHint?: MaybeRefOrGetter<boolean>            // adds the hint id to aria-describedby
}

type FieldApi<T> = {
  id: ComputedRef<string>
  value: Ref<T>
  setValue: (v: T) => void
  errors: ComputedRef<string[]>
  error: ComputedRef<string | undefined>         // first error
  invalid: ComputedRef<boolean>
  touched: Ref<boolean>                          // set on first blur
  dirty: ComputedRef<boolean>                    // value !== value at mount / last reset()
  reset: (value?: T) => void                     // with a value: new baseline (e.g. after loading a record)
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
  required: ComputedRef<boolean>
  labelProps: ComputedRef<{ id: string; for: string }>
  hintProps: ComputedRef<{ id: string }>
  errorProps: ComputedRef<{ id: string; role: 'alert' }>
  controlAria: ComputedRef<{                     // spread onto the real control
    id: string
    'aria-invalid': 'true' | undefined
    'aria-required': 'true' | undefined
    'aria-describedby': string | undefined       // "<id>-hint <id>-error" when present
    disabled: boolean
    readonly: boolean
  }>
  onBlur: () => void
}
```

- It returns a plain object of refs, per Vue's composable guideline, so it can be destructured. Options accept refs or getters through `toValue()`.
- `aria-invalid` follows `errors`. `<AppForm>` only fills `errors` on submit, so empty required fields are not flagged before the first submit (MDN guidance).
- Ids: `<id>`, `<id>-label`, `<id>-hint`, `<id>-error`. `id` stays a prop (today it is required on every input) but becomes optional.

## 2. `<AppInput>` / `useTextInput`

### Props (component)

| Prop | Type | Default | Today | Notes |
|---|---|---|---|---|
| `v-model` | `string \| number \| null` | — | same | `number` when `type="number"` (parsed) |
| `v-model:code` | `string` | — | same | country dial code, only for `type="tel"` |
| `id` | `string` | `useId()` | required | |
| `label` | `string` | — | same | |
| `hint` | `string` | — | — (new) | |
| `errors` | `string[]` | — | same | |
| `type` | `InputTypeHTMLAttribute` | `'text'` | same | |
| `as` | `'input' \| 'textarea'` | `'input'` | `tag` | renamed (vue-kit has no consumers yet, so no alias needed) |
| `required` / `disabled` / `readonly` | `boolean` | `false` | `disabled` via attrs | |
| `mask` | `InputMaskType` (maska) | — | same | |
| `acceptOnly` | `'numbers' \| 'letters' \| 'alphanumeric'` | — | same | |
| `capitalize` | `'first' \| 'each'` | — | same | |
| `displayValue` | `string` | — | same | |
| `icon` / `iconPosition` / `iconConfig` | as today | `'start'` | same | default skin only |
| `copyable` / `copyValue` | `boolean` / `string \| number` | — | `hasCopy` | renamed |
| `rounded` | `'full' \| 'lg' \| 'xl'` | `'xl'` | same | default skin only |
| `rootClass` | `string` | — | — | the wrapper's class, since `class` now goes to `<input>` |
| ~~`classList`~~, ~~`labelClassList`~~ | | | | removed (R4): use `class` and the `label` slot |

### Emits

`update:modelValue`, `update:code`. Native events (`focus`, `blur`, `keydown`, …) are **not** re-emitted. They arrive as attrs and are bound once, on `<input>` (I4).

### `useTextInput` return type

```ts
type TextInputApi = FieldApi<string | number | null> & {
  displayValue: ComputedRef<string>           // masked / displayValue prop
  showPassword: Ref<boolean>
  togglePassword: () => void
  code: Ref<string | undefined>               // tel dial code
  setCode: (c: string) => void
  inputProps: ComputedRef<FieldApi['controlAria'] & {
    type: string                               // 'text' while password is shown
    value: string
    placeholder?: string
    onInput: (e: Event) => void                // acceptOnly → capitalize → mask → parse → model;
                                               // textarea auto-resize; Chrome tel re-render fix
    onFocus: (e: FocusEvent) => void           // re-normalise (today's onFocus)
    onBlur: () => void
  }>
  toggleProps: ComputedRef<{                   // the password eye button
    type: 'button'; 'aria-label': string; 'aria-pressed': boolean
    'aria-controls': string; onClick: () => void
  }>
}
```

All of today's `Input.vue` logic moves into `onInput` / `onFocus`: `normalizeInputValue`, `resizeTextarea`, the Chrome bug #423785 workaround and mask display. The model still holds the masked string, as today, so behaviour does not change. `aria-label` text comes from `messages.togglePassword` (ADR-0008).

### Slots

| Slot | Slot props |
|---|---|
| `label` | `{ labelProps, label, required }` |
| `prefix` | `{ field }` (`field` = the whole `TextInputApi`) |
| `suffix` | `{ field }`. Replaces the built-in copy / password buttons when given |
| `hint` | `{ hintProps, hint }` |
| `error` | `{ errorProps, errors, error }` |
| `default` | the whole `TextInputApi`. Replaces the full markup (level 3) |

## 3. The other v1 inputs, in short

Each one is `FieldApi<T>` plus the members below, with the same slot pattern: part slots plus a default full-override slot that receives the whole API.

| Composable | Extra state / actions | Prop getters | Kept from today |
|---|---|---|---|
| `useSelect<T>` | `open`, `toggle()`, `close()`, `query` (`v-model:query`), `filteredOptions`, `isSelected(o)`, `select(o)`, `remove(o)`, `activeIndex`, `loading` | `triggerProps` (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, key handlers ↑ ↓ Enter Esc Home End), `listboxProps` (`role="listbox"`, `aria-multiselectable`), `optionProps(o, i)` (`role="option"`, `aria-selected`, id) | `multiple`, `searchable`, `lazy` + `isOptionsReady`, `optionsUnselectable`, `selectedOptionsLimit`, `defaultSearchText`, slots `trigger`, `option`, `no-results-found`. Floating position (`@floating-ui/vue`) and virtual list (`@tanstack/vue-virtual`) stay in the **default skin** |
| `useChoice` | `checked`, `toggle()`, `trueValue` / `falseValue` | `inputProps` (native `type="checkbox"`; `role="switch"` for `AppSwitch`) | Checkbox `value`, `description`. Switch `options` (two-label tabs) is a skin variant |
| `useChoiceGroup` | `options`, `isSelected(o)`, `select(o)`, `name` | `groupProps` (`role="radiogroup"` / `group`, `aria-labelledby`), `itemProps(o)` (native radio / checkbox) | `direction`, `selectFirstOption`, `allowSelectionRemoval`. Arrow-key movement comes free from native radios |
| `useDateInput` | `hasValue`, `clear()`, `mode` (`date` / `datetime` / `month` / `week`), `range` (start + end), model normalising (Date or string in, the same shape out as today) | `inputProps` (single), `startProps` / `endProps` (range: end's `min` = start value, start's `max` = end value) | `minDate` / `maxDate` → native `min` / `max`; `required`, `disabled`, `clearable`, `range`, `monthPicker`, `weekPicker` |
| `useTimeInput` | `hours`, `minutes`, `period`, `options` (from `minuteStep`, `min/maxTime`, `format`), `presets`, `clear()` | `columnProps`, `optionProps` | Today's `{ hours, minutes }` model |

**Known ceiling: date (ADR-0010).** The calendar is the browser's native picker. Today's `@vuepic/vue-datepicker` features have no native equivalent and are **dropped**:

- `inline`, `multiCalendars`, `quarterPicker`, `yearPicker`, `multiDates`, `timezone`
- `disabledDates` / `allowedDates` / `disabledTimes` greyed out inside the picker. Native inputs only support `min` / `max`. The composable still rejects these values and reports an error through `errors`.
- the `trigger` and `action-row` slots
- the dark theme of the popup. The native picker follows `color-scheme`, which the default skin sets from `[data-theme]`.

A consumer that needs any of these brings its own picker through level 3 or level 4 and binds the same model and ARIA. Writing our own calendar is out of v1.

## 4. `<AppForm>`

Same API as today's `Form.vue`: `formData`, `schema`, `@submit`, the default slot gets `{ errors }`, and the `validate()` expose. Two changes:

- **Focus the first invalid control** with `form.querySelector('[aria-invalid="true"]')`. This replaces the `[data-form-error]` → parent → selector lookup. It works for any custom UI that binds `inputProps`, which a DOM-shape lookup does not.
- **The dev-tools bypass** (`useDevToolsStore`) becomes a plugin option `devBypassValidation?: () => boolean`. The app supplies it; the package does not know about stores.

## 5. Override levels

### Level 1 — props and attrs

`defineOptions({ inheritAttrs: false })`. `class`, `style`, native attributes and listeners land once, on the real control.

```vue
<AppInput v-model="name" label="Name" class="font-mono" maxlength="50"
  autocomplete="name" @keydown.enter="save" root-class="w-1/2" />
```

### Level 2 — part slots

```vue
<AppInput v-model="price" label="Price" type="number">
  <template #prefix>$</template>
  <template #error="{ errorProps, error }">
    <p v-bind="errorProps" class="text-sm text-app-error">⚠ {{ error }}</p>
  </template>
</AppInput>
```

### Level 3 — full override (default scoped slot)

```vue
<AppInput v-model="email" label="Email" :errors="errors.email" v-slot="f">
  <label v-bind="f.labelProps">{{ f.label }}</label>
  <input v-bind="f.inputProps" class="my-input" />
  <span v-if="f.error" v-bind="f.errorProps">{{ f.error }}</span>
</AppInput>
```

Same masking, normalising, ids and ARIA as the default skin, because all of it is in `inputProps`.

### Level 4 — global override (plugin)

```ts
import { createVueKit } from '@moonlinetravel/vue-kit'
import MyInput from './MyInput.vue'

app.use(createVueKit({
  dir: 'ltr',
  messages: { required: 'This field is required', togglePassword: 'Show password' },
  components: { Input: MyInput },          // also Select, Checkbox, Switch, RadioGroup, DateInput, TimeInput
}))
```

`<AppInput>` always runs `useTextInput()` itself. If a global override is registered, it renders that component with one prop, `field: TextInputField` (the API wrapped in `reactive()`, so refs are unwrapped: `field.inputProps`, not `.value`; the same object the default slot receives), and passes its slots through. A default slot on the instance (level 3) wins over the global override:

```vue
<!-- MyInput.vue -->
<script setup lang="ts">
import type { TextInputApi } from '@moonlinetravel/vue-kit/ui'
defineProps<{ field: TextInputApi }>()
</script>
<template>
  <div class="my-field">
    <label v-bind="field.labelProps">{{ field.label }}</label>
    <input v-bind="field.inputProps" />
    <small v-if="field.error" v-bind="field.errorProps">{{ field.error }}</small>
  </div>
</template>
```

The override never re-implements behaviour; it can only bind what the composable gives it. Config travels through `app.provide` with typed `InjectionKey`s. With no plugin installed, the defaults apply.

Exports per input: `useTextInput`, `AppInput`, the default skin `AppInputSkin` (for reuse inside overrides), and the types `TextInputApi` / `TextInputProps`.

## 6. Proof of the contract

One suite per input, run against three UIs:

```ts
const uis = [
  ['default', DefaultHarness],            // <AppInput v-bind="props" />
  ['slot override', SlotHarness],         // level 3: bare label / input / error
  ['global override', PluginHarness],     // level 4: MyInput via createVueKit
] as const

describe.each(uis)('AppInput (%s)', (_, Harness) => { /* … */ })
```

Cases for `AppInput` (each one maps to today's behaviour or a finding):

1. Typing updates `v-model`. `v-model` updates the shown value.
2. `mask`, `acceptOnly`, `capitalize` give the same output as today's `Input.vue`, on input and on focus.
3. `type="number"` gives a number model.
4. `label` `for` = input `id`. `aria-describedby` points at the error id when there are errors. `aria-invalid="true"` only when there are errors.
5. The error element has `role="alert"`.
6. `disabled` / `readonly` / `required` reach the control.
7. Native attrs and `class` land on the control only. A `@keydown.enter` listener fires **once** (regression for I4).
8. Password toggle switches the type. Its `aria-label` comes from `messages`.
9. `<AppForm>` submit with errors focuses the first `[aria-invalid="true"]`.
10. Dependency guard (once, not per UI): no file under `src/ui/` imports a package outside the ADR-0010 allow-list.

If a case passes on one UI and fails on another, behaviour has leaked into a template. Move it into the composable.

Setup (A6): `@vitejs/plugin-vue` + `happy-dom` + `@vue/test-utils` in the vue-kit repo only (new dev dependency, ADR-0001 keeps portal-iq-vue untouched).

## Deferred, with reason

- **Debounce.** No input debounces today; search debounce lives in callers (`useDebounceFn`). Add a `debounce` option to `useField` when a second caller needs it.
- **Unmasked model value.** Today the model holds the masked string. Changing that is a behaviour change → a later minor with an opt-in prop.
- **Error summary at the top of the form** (W3C pattern). Not in today's forms. Can be built by a consumer from `<AppForm>`'s `errors` slot prop.
