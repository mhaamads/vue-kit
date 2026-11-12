# Nuxt

vue-kit works in Nuxt 3 and 4, with server-side rendering. Every component is tested to render on
the server.

## 1. Install

```sh
npm install @mhaamads/vue-kit
```

## 2. Add a plugin

```ts
// plugins/vue-kit.ts
import { createVueKit } from '@mhaamads/vue-kit/ui'
import { ui } from '~/ui/ui' // your classes (optional)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createVueKit({ ui }))
})
```

Nuxt loads every file in `plugins/` by itself.

## 3. Add the CSS

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@vuepic/vue-datepicker/dist/main.css', '~/assets/css/main.css'],
})
```

The first file is the date picker's calendar; the second is your own styles (e.g. Tailwind and
our `skin.css`).

## 4. Toasts and confirm

```vue
<!-- app.vue -->
<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <AppToasts />
  <AppConfirmDialog />
</template>

<script setup lang="ts">
import { AppConfirmDialog, AppToasts } from '@mhaamads/vue-kit/ui'
</script>
```

## Using components

Import them where you use them:

```vue
<script setup lang="ts">
import { AppInput } from '@mhaamads/vue-kit/ui'
</script>
```

Or register them all once in the plugin, so you never import them:

```ts
import * as Kit from '@mhaamads/vue-kit/ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Kit.createVueKit())
  for (const [name, component] of Object.entries(Kit)) {
    if (name.startsWith('App')) nuxtApp.vueApp.component(name, component as never)
  }
})
```

## Good to know

- **Links:** `<AppButton to="/tasks">` renders Nuxt's router link. For `NuxtLink` features
  (prefetching), use `<AppButton :as="NuxtLink" to="/tasks">` with
  `import { NuxtLink } from '#components'`.
- **Toasts and confirm on the server:** `useToast()` and `useConfirm()` do nothing during server
  rendering (`useConfirm` resolves `false`). Call them from the browser, e.g. in click handlers or
  `onMounted`. This keeps one visitor's toasts from reaching another.
- **Language:** `<html lang dir>` is written in the browser. To have it right in the server HTML
  too, set it with `useHead({ htmlAttrs: { lang, dir } })` from the kit's `locale` and `dir`.
- **ids:** labels and inputs use Vue's `useId()`, so server and browser ids match (no hydration
  warnings).
