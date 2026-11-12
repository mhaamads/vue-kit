# Time picker

`AppTimeInput`: pick a time from columns of hours and minutes.

<script setup>
import { ref } from 'vue'
const pickup = ref(null)
const office = ref(null)
const meeting = ref(null)
const presets = [
  { label: 'Morning', value: { hours: 9, minutes: 0 } },
  { label: 'Noon', value: { hours: 12, minutes: 0 } },
  { label: 'Evening', value: { hours: 18, minutes: 0 } },
]
</script>

<Demo>
  <AppTimeInput v-model="pickup" label="Pickup time" />
  <p class="mt-3 text-xs text-vk-muted">v-model: <code>{{ JSON.stringify(pickup) }}</code></p>
</Demo>

```vue
<AppTimeInput v-model="pickup" label="Pickup time" />
<!-- pickup = { hours: 14, minutes: 30 } -->
```

**Any time can be picked**, past or future. Limits only apply when you ask for them.

## Only between two times

For example office hours, 08:30 to 17:00:

<Demo>
  <AppTimeInput v-model="office" label="Visit time" min-time="08:30" max-time="17:00" :minute-step="15" hint="Office hours: 08:30 – 17:00" />
</Demo>

```vue
<AppTimeInput v-model="visit" min-time="08:30" max-time="17:00" :minute-step="15" />
```

Times outside the range are greyed out. Use 24-hour `"HH:mm"` for the limits, even when you show
a 12-hour clock. The AM / PM labels come from the language (`messages.am`, `messages.pm`).

## 12-hour clock with quick picks

<Demo>
  <AppTimeInput v-model="meeting" label="Meeting" :format="12" :presets="presets" />
</Demo>

```vue
<AppTimeInput v-model="meeting" :format="12" :presets="presets" />

const presets = [
  { label: 'Morning', value: { hours: 9, minutes: 0 } },
  { label: 'Noon', value: { hours: 12, minutes: 0 } },
]
```

## Props

| Prop                     | What                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `v-model`                | `{ hours, minutes }` (also accepts `"09:30"` or `"0930"`)  |
| `format`                 | `24` (default) or `12`                                     |
| `minute-step`            | `1`, `5`, `10`, `15`, `30`                                 |
| `min-time`, `max-time`   | Optional limits, `"HH:mm"`, e.g. `"08:30"` and `"17:00"`   |
| `presets`                | Quick buttons: `{ label, value }[]`                        |
| `label`, `hint`, `errors`, `clearable`, `disabled` | As in every input                |

**Slots:** `label`, `hint`, `errors`, `leading`, `trailing` (get `field`), `clear` (gets `clear`,
`props`).

**Style keys:** `root` `label` `control` `leading` `trigger` `trailing` `clear` `panel` `presets`
`preset` `column` `option` `now` `ok` `hint` `errors`
