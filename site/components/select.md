# Select

`AppSelect`: pick one or many options. You can type to search.

<script setup>
import { ref } from 'vue'
const cities = [
  { label: 'Erbil', value: 1, description: 'Head office' },
  { label: 'Baghdad', value: 2 },
  { label: 'Basra', value: 3 },
  { label: 'Duhok', value: 4 },
  { label: 'Mosul', value: 5, disabled: true },
]
const city = ref(null)
const many = ref([1, 3, 4])
const plain = ref(3)
const two = ref([1])
</script>

<Demo>
  <AppSelect v-model="city" label="City" :options="cities" />
</Demo>

```vue
<script setup lang="ts">
const cities = [
  { label: 'Erbil', value: 1, description: 'Head office' },
  { label: 'Baghdad', value: 2 },
  { label: 'Mosul', value: 5, disabled: true },
]
const city = ref(null)
</script>

<template>
  <AppSelect v-model="city" label="City" :options="cities" />
</template>
```

## Many options

<Demo>
  <AppSelect v-model="many" label="Cities" :options="cities" multiple :selected-options-limit="2" />
</Demo>

```vue
<AppSelect v-model="cities" label="Cities" :options="options" multiple :selected-options-limit="2" />
```

## At most a few picks

<Demo>
  <AppSelect v-model="two" label="Pick up to 2" :options="cities" multiple :max-values="2" />
</Demo>

```vue
<AppSelect v-model="cities" :options="options" multiple :max-values="2" />
```

Once 2 are picked, the rest are greyed out until you remove one.

## No search

<Demo>
  <AppSelect v-model="plain" label="City" :options="cities" :searchable="false" />
</Demo>

```vue
<AppSelect v-model="city" label="City" :options="cities" :searchable="false" />
```

## Props

| Prop                     | What                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `v-model`                | The chosen value (an array with `multiple`)                |
| `options`                | `{ label, value, description?, disabled? }[]`              |
| `label`, `hint`, `errors` | As in every input                                         |
| `multiple`               | Pick many; shows chips                                     |
| `selected-options-limit` | Show at most this many chips, then "2 more selected"       |
| `max-values`             | Multiple: at most this many picks                          |
| `searchable`             | Type to search (default on)                                |
| `placeholder`            | Shown while empty                                          |
| `loading`                | Shows "Loading options..."                                 |
| `lazy` + `@load-options` | Load options the first time it opens                       |

Long lists (thousands of options) stay fast. When you type, the first match is highlighted, so
Enter picks it.

`v-model` gets the type of your option values: with `value: number` options it's a `number` (or
`number[]` with `multiple`).

**Slots:** `label`, `hint`, `errors`, `leading`, `trailing` (get `field`), `option` (gets
`option`, `selected`), `chip` (gets `option`), `empty` (gets `text`, `query`).

**Style keys:** `root` `label` `control` `trigger` `content` `option` `optionDescription` `empty` `chips` `chip` `chipRemove` `chipMore` `hint` `errors`
