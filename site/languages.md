# Languages

vue-kit speaks **English** by default. You can add other languages and switch while the app runs.
Right-to-left languages flip the direction too.

<script setup>
import { ref } from 'vue'
import { defaultUiMessages } from '../src/ui'
import { defaultValidationMessages } from '../src/utils'
import { defaultHttpMessages } from '../src/http'

const city = ref(null)
const show = (v) => (typeof v === 'function' ? v.toString() : JSON.stringify(v))
const tables = [
  ['Components', defaultUiMessages],
  ['Validation (AppForm, validate)', defaultValidationMessages],
  ['HTTP client (createHttpClient)', defaultHttpMessages],
]
</script>

## Try it

<LanguageDemo>
  <div class="grid gap-4">
    <AppSelect v-model="city" label="City" :options="[{ label: 'Erbil', value: 1 }]" />
    <AppDateInput label="Travel date" />
    <AppInput label="Password" type="password" model-value="secret" />
  </div>
</LanguageDemo>

Only this box changes: the kit's texts (placeholders, button labels) and the direction. Labels come
from your app, so you translate those yourself.

To give one part of your own app another language, the same way: `provideVueKit(createVueKit({
locale: 'ar', syncDocument: false }))` in that part's `setup`.

## 1. Add a language

```ts
// i18n/ckb.ts
import type { VueKitLocale } from '@mhaamads/vue-kit/ui'

export const ckb: VueKitLocale = {
  dir: 'rtl',
  messages: {
    close: 'داخستن',
    required: (field) => `${field} پێویستە.`,
    // Anything you leave out stays English.
  },
}
```

```ts
// main.ts
createApp(App)
  .use(createVueKit({ locale: 'en', locales: { ckb } }))
  .mount('#app')
```

The calendar in `AppDateInput` takes a date-fns locale per language:
`ar: { dir: 'rtl', dateLocale: ar, messages: { … } }` (with `import { ar } from 'date-fns/locale'`).

## 2. Switch language

```ts
const { setLocale } = useVueKit() // inside a component
setLocale('ckb')
```

Outside components (a store), export the kit from `main.ts` and call `kit.setLocale('ckb')`.

On a switch, the kit's texts change, errors already on screen are re-written, and `<html lang dir>`
is updated (turn that off with `syncDocument: false`).

## 3. Load a language later

```ts
const { default: ar } = await import('./i18n/ar')
kit.addLocale('ar', ar)
kit.setLocale('ar')
```

## Using vue-i18n?

```ts
watch(i18n.global.locale, (name) => kit.setLocale(name))
```

## HTTP messages

Give `createHttpClient` a function, so its toasts follow the language too:

```ts
createHttpClient({ baseUrls: { main: API_URL }, messages: () => httpTexts[kit.locale.value] })
```

## Every text you can translate

<template v-for="[title, messages] in tables" :key="title">
  <h3>{{ title }}</h3>
  <table>
    <thead><tr><th>Key</th><th>English</th></tr></thead>
    <tbody>
      <tr v-for="(value, key) in messages" :key="key">
        <td><code>{{ key }}</code></td>
        <td><code>{{ show(value) }}</code></td>
      </tr>
    </tbody>
  </table>
</template>
