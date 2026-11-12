# Checkbox and switch

<script setup>
import { ref } from 'vue'
const terms = ref(false)
const notify = ref(true)
</script>

## Checkbox

<Demo>
  <AppCheckbox v-model="terms" label="I accept the travel policy" description="Required for every booking." />
</Demo>

```vue
<AppCheckbox v-model="terms" label="I accept the travel policy" description="Required for every booking." />
```

## Switch

<Demo>
  <AppSwitch v-model="notify" label="Email me updates" />
</Demo>

```vue
<AppSwitch v-model="notify" label="Email me updates" />
```

## Props

| Prop                         | What                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `v-model`                    | `true` / `false`                                              |
| `label`, `description`       | Text next to and under the box (description: checkbox only)   |
| `true-value`, `false-value`  | Use other values, e.g. `'Y'` / `'N'`                          |
| `value`                      | Checkbox only: model is this value when checked, else empty  |
| `errors`, `disabled`, `readonly` | As usual                                                 |

**Slots:** `label` (the text next to the box; gets `label`, `checked`), `description`, `hint`,
`errors`.

**Style keys:** `root` `label` `input` `description` `hint` `errors`

The switch on this site is a normal checkbox drawn with CSS (see `switch.input` in `site/skin/ui.ts`).
