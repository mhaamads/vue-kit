# Form and validation

`AppForm` checks your data when the user submits. It shows the errors on the fields and moves focus
to the first wrong one.

<script setup>
import { reactive } from 'vue'
import { defineSchema } from '../../src/utils'
import { useToast } from '../../src/ui'

const data = reactive({ name: '', email: '', terms: false })
const schema = defineSchema({
  name: { required: true, label: 'Name' },
  email: { required: true, isEmail: true, label: 'Email' },
  terms: { accepted: true, label: 'The terms' },
})
const save = () => useToast({ type: 'success', message: 'Saved.' })
</script>

<Demo>
  <AppForm :form-data="data" :schema="schema" class="grid gap-4" @submit="save" v-slot="{ errors }">
    <AppInput v-model="data.name" label="Name" required :errors="errors.name" />
    <AppInput v-model="data.email" label="Email" required :errors="errors.email" />
    <AppCheckbox v-model="data.terms" label="I accept the terms" :errors="errors.terms" />
    <AppButton type="submit" variant="primary" class="w-max">Save</AppButton>
  </AppForm>
</Demo>

Click **Save** while it's empty.

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { defineSchema } from '@mhaamads/vue-kit/utils'

const data = reactive({ name: '', email: '' })
const schema = defineSchema<typeof data>({
  name: { required: true, label: 'Name' },
  email: { required: true, isEmail: true, label: 'Email' },
})
</script>

<template>
  <AppForm :form-data="data" :schema="schema" @submit="save" v-slot="{ errors }">
    <AppInput v-model="data.name" label="Name" :errors="errors.name" />
    <AppInput v-model="data.email" label="Email" :errors="errors.email" />
    <AppButton type="submit">Save</AppButton>
  </AppForm>
</template>
```

`@submit` only runs when everything is valid, including fields inside the form that have their
own [`rules`](/components/input#check-this-field-on-its-own-optional).

## Show errors while filling in (optional)

By default errors appear when the user submits. With `validate-on="blur"`, a field they changed is
checked as soon as they leave it, and its error goes away as they fix it. Fields they haven't
touched stay quiet until submit.

```vue
<AppForm :form-data="data" :schema="schema" validate-on="blur" @submit="save" v-slot="{ errors }">
```

## Clear the errors from code

```vue
<script setup lang="ts">
const form = ref()

const load = async () => {
  Object.assign(data, await api.getTask(id))
  form.value.resetValidation() // no errors, and this data counts as "not changed"
}
</script>

<AppForm ref="form" :form-data="data" :schema="schema">…</AppForm>
```

`form.value.validate()` checks everything now (returns `true` / `false`).

## Warn about unsaved changes (optional)

With `warn-unsaved`, the browser asks "Leave site?" when the user closes or reloads the page while
the form has changes that weren't submitted.

```vue
<AppForm :form-data="data" :schema="schema" warn-unsaved @submit="save">
```

For moving to another page inside your app, use the exposed `dirty` with vue-router:

```ts
onBeforeRouteLeave(async () => !form.value.dirty || (await useConfirm('Leave without saving?')))
```

## Props

| Prop           | What                                                  |
| -------------- | ----------------------------------------------------- |
| `form-data`    | Your data object                                      |
| `schema`       | The rules (`defineSchema`)                            |
| `validate-on`  | `submit` (default) or `blur`                          |
| `warn-unsaved` | Ask before leaving the page with unsaved changes      |

**From code:** `validate()`, `resetValidation()`, `errors`, `dirty`.

## Rules you can use

`required`, `accepted` (must be ticked, e.g. "I accept the terms"), `isEmail`, `isUrl`, `pattern`,
`min`, `max`, `minLength`, `maxLength`, `enum`, `matches` (e.g. repeat password), `custom` (your
own function), `array`, `object`.

`required` counts `false` and `0` as answers (a "No" or a zero is a real value). For a checkbox
that must be ticked, use `accepted: true`.
