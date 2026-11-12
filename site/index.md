# Getting started

**vue-kit** gives Vue 3 apps ready-made form inputs, dialogs and toasts.
They work out of the box. They ship **no CSS**, so your app decides how they look.

<script setup>
import { ref } from 'vue'
const name = ref('')
</script>

<Demo>
  <AppInput v-model="name" label="Your name" placeholder="Type here" />
</Demo>

## 1. Install

```sh
npm install @mhaamads/vue-kit
```

Add the registry once, in `.npmrc`: `@mhaamads:registry=https://npm.pkg.github.com`

## 2. Set it up

```ts
// main.ts
import { createApp } from 'vue'
import { createVueKit } from '@mhaamads/vue-kit/ui'
import App from './App.vue'

createApp(App).use(createVueKit()).mount('#app')
```

## 3. Use a component

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AppInput } from '@mhaamads/vue-kit/ui'

const name = ref('')
</script>

<template>
  <AppInput v-model="name" label="Your name" />
</template>
```

It works now, but it's plain. Next step: [give it your look →](/styling)

While you develop, the console warns about any field without a label, so nothing ships that
screen readers can't name.

## What's inside

| Import                          | What                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| `@mhaamads/vue-kit/ui`    | Inputs, select, date, time, form, button, dialog, toasts     |
| `@mhaamads/vue-kit/utils` | Validation, date formatting, colours, event bus, helpers     |
| `@mhaamads/vue-kit/http`  | `createHttpClient`: fetch with auth hooks, errors and toasts |
