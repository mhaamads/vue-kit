# Text input

`AppInput`: a text field with label, hint and errors.

<script setup>
import { ref } from 'vue'
const name = ref('')
const password = ref('secret')
const birth = ref('')
const phone = ref('')
const code = ref('+964')
const notes = ref('')
const search = ref('')
const secret = ref('hunter2')
const clearMe = ref('Erbil office')
const bio = ref('')
const query = ref('')
const username = ref('sara')
const email = ref('')
</script>

<Demo>
  <AppInput v-model="name" label="Full name" placeholder="e.g. Sara Ahmed" hint="As on the passport" />
</Demo>

```vue
<AppInput v-model="name" label="Full name" placeholder="e.g. Sara Ahmed" hint="As on the passport" />
```

## With an error

<Demo>
  <AppInput label="Email" :errors="['Email is required.']" required />
</Demo>

```vue
<AppInput v-model="email" label="Email" :errors="['Email is required.']" required />
```

Errors usually come from [`AppForm`](/components/form).

## Password

<Demo>
  <AppInput v-model="password" label="Password" type="password" />
</Demo>

```vue
<AppInput v-model="password" label="Password" type="password" />
```

## Mask

<Demo>
  <AppInput v-model="birth" label="Birth date" mask="##-##-####" placeholder="DD-MM-YYYY" />
</Demo>

```vue
<AppInput v-model="birth" label="Birth date" mask="##-##-####" placeholder="DD-MM-YYYY" />
```

## Phone with country code

<Demo>
  <AppInput v-model="phone" v-model:code="code" label="Phone" type="tel" mask="### ### ####" />
</Demo>

```vue
<AppInput v-model="phone" v-model:code="code" label="Phone" type="tel" mask="### ### ####" />
```

Click the code (or tab to it) and type to search: a country name in English or its own language
(`العراق`), its code (`IQ`) or the number (`964`).

## Multi-line

<Demo>
  <AppInput v-model="notes" label="Notes" as="textarea" placeholder="Grows as you type" />
</Demo>

```vue
<AppInput v-model="notes" label="Notes" as="textarea" />
```

## Clear button

<Demo>
  <AppInput v-model="clearMe" label="Branch" clearable />
</Demo>

```vue
<AppInput v-model="branch" label="Branch" clearable />
```

Clearing sets the model to `null`. To draw it yourself: `<template #clear="{ clear, props }">`.

## Character counter

<Demo>
  <AppInput v-model="bio" label="Short bio" counter maxlength="50" />
</Demo>

```vue
<AppInput v-model="bio" label="Short bio" counter maxlength="50" />
```

Without `maxlength` it just counts.

## Wait until typing stops (debounce)

<Demo>
  <AppInput v-model="query" label="Search" placeholder="Type…" :debounce="500" />
  <p class="mt-3 text-xs text-vk-muted">v-model (after 0.5 s): <code>{{ JSON.stringify(query) }}</code></p>
</Demo>

```vue
<AppInput v-model="query" label="Search" :debounce="500" />
```

The field shows what you type right away; `v-model` updates 500 ms after the last key (or when
you leave the field). Good for searching on the server.

## Loading

<Demo>
  <AppInput v-model="username" label="Username" loading hint="Checking if it's free…" />
</Demo>

```vue
<AppInput v-model="username" label="Username" :loading="checking" />
```

## Check this field on its own (optional)

By default a field only shows errors you give it (usually from [`AppForm`](/components/form)).
Pass `rules` and it checks itself: first when you leave it, then while you fix it.

<Demo>
  <AppInput v-model="email" label="Email" :rules="{ required: true, isEmail: true }" />
</Demo>

```vue
<AppInput v-model="email" label="Email" :rules="{ required: true, isEmail: true }" />
```

The rules are the same as in a form schema (`required`, `isEmail`, `minLength`, `pattern`,
`custom`, …). To check from code: `inputRef.value.validate()` returns `true` or `false`.

## Icons and buttons inside the field

Use `leading` (before the text) and `trailing` (after it). They get `field`, so a button can act on
the input:

<Demo>
  <AppInput v-model="search" label="Search" placeholder="Search tasks">
    <template #leading>🔍</template>
    <template #trailing="{ field }">
      <AppButton v-if="field.value" variant="ghost" aria-label="Clear" @click="field.setValue('')">✕</AppButton>
    </template>
  </AppInput>
</Demo>

```vue
<AppInput v-model="search" label="Search">
  <template #leading>🔍</template>
  <template #trailing="{ field }">
    <AppButton v-if="field.value" variant="ghost" aria-label="Clear" @click="field.setValue('')">✕</AppButton>
  </template>
</AppInput>
```

## Your own show-password and copy buttons

The built-in buttons are `AppButton`s with the `ghost` look, so they follow your
[button classes](/components/button). To draw them yourself, use their slot. It gives you the state,
the function, and `props` (the accessible label and click handler) to put on your button:

<Demo>
  <AppInput v-model="secret" label="API key" type="password" copyable>
    <template #password-toggle="{ visible, props }">
      <AppButton v-bind="props" variant="ghost">{{ visible ? '🙈' : '👁' }}</AppButton>
    </template>
    <template #copy="{ copied, props }">
      <AppButton v-bind="props" variant="ghost">{{ copied ? '✓' : '⧉' }}</AppButton>
    </template>
  </AppInput>
</Demo>

```vue
<AppInput v-model="key" type="password" copyable>
  <template #password-toggle="{ visible, toggle, props }">
    <button v-bind="props">{{ visible ? 'Hide' : 'Show' }}</button>
  </template>
  <template #copy="{ copied, copy, props }">
    <button v-bind="props">{{ copied ? 'Copied!' : 'Copy' }}</button>
  </template>
</AppInput>
```

Or keep them and only change their classes: `:ui="{ passwordToggle: '…', copy: '…' }"`.

## Props

| Prop            | What                                                           |
| --------------- | -------------------------------------------------------------- |
| `v-model`       | The value                                                      |
| `label`, `hint` | Text above and below the field                                 |
| `errors`        | List of error messages                                         |
| `type`          | `text`, `email`, `password`, `number` (model is a number), `tel` |
| `mask`          | Input mask, e.g. `'##-##-####'`                                |
| `accept-only`   | `numbers`, `letters` or `alphanumeric`                         |
| `capitalize`    | `first` or `each` word                                         |
| `as`            | `textarea` for multi-line                                      |
| `copyable`      | Adds a Copy button                                             |
| `clearable`     | Adds a Clear button (model becomes `null`)                     |
| `counter`       | Shows the character count (`12 / 50` with `maxlength`)        |
| `debounce`      | Ms to wait after typing before `v-model` updates               |
| `loading`       | Shows a loading indicator                                      |
| `rules`         | Check this field on its own (optional)                         |
| `required`, `disabled`, `readonly` | As usual                                     |

Any other attribute (`placeholder`, `maxlength`, `autocomplete`, `@keydown`…) goes to the `<input>`.

**Slots:** `label`, `hint`, `errors` (gets `errors`, `error`), `leading`, `trailing` (get `field`),
`clear` (gets `clear`, `props`), `password-toggle` (gets `visible`, `toggle`, `props`), `copy`
(gets `copied`, `copy`, `props`).

**From code** (with a template `ref`): `validate()`, `focus()`.

**Style keys:** `root` `label` `control` `leading` `input` `trailing` `loading` `clear` `passwordToggle` `copy` `counter` `hint` `errors`, and for the phone code: `country` `countryTrigger` `countryMenu` `countryOption`
