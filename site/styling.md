# Customize

The components have **no CSS**. You give each piece a class, **once for the whole app**.

## Set your classes once

```ts
// main.ts
createApp(App)
  .use(
    createVueKit({
      ui: {
        input: {
          label: 'text-sm font-medium',
          input: 'h-10 w-full rounded-lg border px-3',
        },
      },
    }),
  )
  .mount('#app')
```

Every `<AppInput>` in your app now has these classes.

## Change one field

<script setup>
import { computed, ref } from 'vue'

const accent = ref('#4f46e5')
const vars = computed(() => ({ '--vk-accent': accent.value }))
const city = ref(1)
const on = ref(true)
</script>

<Demo>
  <AppInput label="Search" placeholder="Search tasks" :ui="{ control: 'vk-box rounded-full bg-vk-subtle' }" />
</Demo>

```vue
<AppInput label="Search" :ui="{ control: 'h-10 rounded-full bg-gray-100 px-4' }" />
```

The field's own class wins. Pieces you don't mention keep the app-wide classes.

## Change what's inside

Every piece shows sensible content. To show something else, use its slot. The kit keeps the ids,
ARIA and behaviour; you only change the content.

<Demo>
  <AppInput label="Email" :errors="['Email is required.']">
    <template #label>Email <span class="text-xs text-vk-muted">(work)</span></template>
    <template #hint>Not sure? <a href="#" class="text-vk-accent underline">Ask IT</a></template>
    <template #errors="{ error }">⚠️ {{ error }}</template>
  </AppInput>
</Demo>

```vue
<AppInput label="Email" :errors="errors.email">
  <template #label>Email <span class="text-xs">(work)</span></template>
  <template #hint>Not sure? <a href="/help">Ask IT</a></template>
  <template #errors="{ error }">⚠️ {{ error }}</template>
</AppInput>
```

| Component                      | Slots                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Every input                    | `label`, `hint`, `errors`                                                    |
| `AppInput`                     | `leading`, `trailing`, `clear`, `password-toggle`, `copy`                    |
| `AppSelect`                    | `leading`, `trailing`, `option`, `chip`, `empty`                             |
| `AppCheckbox`, `AppSwitch`     | `label` (text next to the box), `description` (checkbox)                     |
| `AppRadioGroup`, `AppCheckboxGroup` | `item` (each option's content; gets `option`, `checked`)                |
| `AppDateInput`, `AppTimeInput` | `leading`, `trailing`, `clear` (date: also every vue-datepicker slot)        |
| `AppDialog`                    | `title`, default, `footer`, `close`                                          |
| `AppToasts`                    | `message`, `close`                                                           |

Each component page shows what its slots get.

## Buttons look the same everywhere

Set your button looks once in `ui.button`. The kit's own buttons use them too (confirm dialog,
dialog close, toasts, show password, copy, clear). See [Button](/components/button).

## Which pieces can I style?

Each component page lists its **style keys** at the bottom. Every input has `root`, `label`, `hint`
and `errors`.

## Style by state

Pieces tell you their state through attributes. Use them in your classes:

```ts
option: 'px-3 data-[active]:bg-gray-100'      // highlighted select option
item: 'border data-[state=checked]:border-blue-600' // chosen radio card
toast: 'data-[type=error]:border-red-600'     // error toast
```

| Attribute                                        | Where                        |
| ------------------------------------------------ | ---------------------------- |
| `data-invalid`, `data-disabled`, `data-required` | every input `root`           |
| `data-state="checked"`                           | checkbox, switch, group item |
| `data-active`, `data-selected`                   | select option                |
| `data-open`                                      | select and time `root`       |
| `data-type`                                      | toast                        |

## Brand colour

Keep your colours in CSS variables. Then changing your brand is one line. Try it:

<Demo>
  <label class="mb-5 flex items-center gap-2 text-sm">Colour <input v-model="accent" type="color" /></label>
  <div :style="vars" class="grid gap-4">
    <AppSelect v-model="city" label="City" :options="[{ label: 'Erbil', value: 1 }, { label: 'Basra', value: 2 }]" />
    <AppSwitch v-model="on" label="Email me updates" />
    <AppButton variant="primary" class="w-max">Save</AppButton>
  </div>
</Demo>

```css
:root {
  --vk-accent: #4f46e5; /* your brand colour */
}
```

## Corners

Corners are plain classes, like everything else. Change them for the whole app once, or for one
field:

```ts
createVueKit({ ui: { input: { control: 'vk-box rounded-full' }, button: { primary: 'vk-button rounded-full' } } })
```

```vue
<AppInput label="Search" :ui="{ control: 'vk-box rounded-none' }" />
```

## Copy our look

The look on this site is two files. Copy them into your app and change anything:

- [`site/skin/ui.ts`](https://github.com/mhaamads/vue-kit/blob/main/site/skin/ui.ts): the classes for every component
- [`site/skin/skin.css`](https://github.com/mhaamads/vue-kit/blob/main/site/skin/skin.css): colours, corners, font, dark mode

```ts
import './ui/skin.css'
import { ui } from './ui/ui'

createApp(App).use(createVueKit({ ui })).mount('#app')
```

## Still not enough?

Classes and slots cover almost everything. If a screen needs a layout no component has, each one is
built on a composable (`useTextInput`, `useSelect`, `useChoice`, `useChoiceGroup`, `useTimeInput`).
Call it and bind its `…Props` objects to your own tags:

```vue
<script setup lang="ts">
const model = defineModel<string>()
const field = reactive(useTextInput({ model, mask: '#### #### #### ####' }))
</script>

<template>
  <label v-bind="field.labelProps">Card</label>
  <input v-bind="field.inputProps" />
</template>
```
