# Radio and checkbox groups

<script setup>
import { ref } from 'vue'
const types = [
  { label: 'Lead', value: 'lead', description: 'Not booked yet' },
  { label: 'Customer', value: 'customer', description: 'Has a booking' },
  { label: 'Archived', value: 'archived', disabled: true },
]
const interests = [
  { label: 'Visa help', value: 'visa' },
  { label: 'Flights', value: 'flights' },
  { label: 'Hotels', value: 'hotels' },
]
const type = ref('lead')
const picked = ref(['visa'])
</script>

## Radio group: pick one

<Demo>
  <AppRadioGroup v-model="type" label="Account type" :options="types" />
</Demo>

```vue
<AppRadioGroup v-model="type" label="Account type" :options="types" />
```

## Checkbox group: pick many

<Demo>
  <AppCheckboxGroup v-model="picked" label="Interests" :options="interests" />
</Demo>

```vue
<AppCheckboxGroup v-model="picked" label="Interests" :options="interests" />
```

## Props

| Prop                       | What                                               |
| -------------------------- | -------------------------------------------------- |
| `v-model`                  | The value (an array for the checkbox group)        |
| `options`                  | `{ label, value, description?, disabled? }[]`      |
| `label`, `hint`, `errors`  | As in every input                                  |
| `select-first-option`      | Radio: pick the first one when empty (default on)  |
| `allow-selection-removal`  | Radio: click the chosen one again to clear it      |

**Slots:** `label`, `item` (each option's content; gets `option`, `checked`), `hint`, `errors`.

**Style keys:** `root` `label` `group` `item` `itemInput` `itemDescription` `hint` `errors`

Each option is a `<label>` with `data-state="checked"`, so it can look like a card (as on this site).
