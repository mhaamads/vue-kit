# Date picker

`AppDateInput` is a date field with a calendar. The calendar is
[`@vuepic/vue-datepicker`](https://vue3datepicker.com), the same picker portal-iq-vue uses. The kit
draws the field around it: label, hint, errors, clear button and your classes.

<script setup>
import { ref } from 'vue'
const day = ref(null)
const trip = ref(null)
const meeting = ref(null)
const month = ref({ month: 10, year: 2026 })
const year = ref(2026)
const week = ref(null)
const booking = ref(null)
const visa = ref(null)
const holiday = ref(null)
const formatted = ref(new Date())
const isWeekend = (date) => date.getDay() === 5 || date.getDay() === 6
const today = new Date()
const inTwoMonths = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate())
const show = (v) => JSON.stringify(v)
</script>

<Demo>
  <AppDateInput v-model="day" label="Travel date" />
  <p class="mt-3 text-xs text-vk-muted">v-model: <code>{{ show(day) }}</code></p>
</Demo>

```vue
<AppDateInput v-model="day" label="Travel date" />
```

## Set up once

The calendar has its own CSS. Import it once, next to your own styles:

```ts
// main.ts
import '@vuepic/vue-datepicker/dist/main.css'
```

Match its colours to your app with its CSS variables (our skin does this in `site/skin/skin.css`):

```css
.dp__theme_light,
.dp__theme_dark {
  --dp-primary-color: var(--vk-accent); /* selected day */
  --dp-background-color: var(--vk-surface);
  --dp-text-color: var(--vk-fg);
}
```

## What do you want to pick?

### A date range

<Demo>
  <AppDateInput v-model="trip" label="Trip" range />
  <p class="mt-3 text-xs text-vk-muted">v-model: <code>{{ show(trip) }}</code></p>
</Demo>

```vue
<AppDateInput v-model="trip" label="Trip" range />
<!-- trip = [start, end] -->
```

### A date and a time

<Demo>
  <AppDateInput v-model="meeting" label="Meeting" mode="datetime" />
</Demo>

```vue
<AppDateInput v-model="meeting" label="Meeting" mode="datetime" />
```

### A month, a year, or a week

<Demo>
  <div class="grid gap-4">
    <AppDateInput v-model="month" label="Report month" mode="month" />
    <AppDateInput v-model="year" label="Year" mode="year" />
    <AppDateInput v-model="week" label="Week" mode="week" />
  </div>
  <p class="mt-3 text-xs text-vk-muted">month: <code>{{ show(month) }}</code> · year: <code>{{ year }}</code> · week: <code>{{ show(week) }}</code></p>
</Demo>

```vue
<AppDateInput v-model="month" mode="month" /> <!-- { month: 10, year: 2026 }; month starts at 0 -->
<AppDateInput v-model="year" mode="year" />   <!-- 2026 -->
<AppDateInput v-model="week" mode="week" />   <!-- [monday, sunday] -->
```

## Limit which days can be picked

### Only from today to two months ahead

<Demo>
  <AppDateInput v-model="booking" label="Booking date" :min-date="today" :max-date="inTwoMonths" />
</Demo>

```vue
<AppDateInput v-model="booking" :min-date="new Date()" :max-date="inTwoMonths" />
```

### No weekends

<Demo>
  <AppDateInput v-model="visa" label="Visa appointment" :disabled-dates="isWeekend" hint="Friday and Saturday are closed" />
</Demo>

```vue
<script setup lang="ts">
const isWeekend = (date: Date) => date.getDay() === 5 || date.getDay() === 6
</script>

<AppDateInput v-model="visa" :disabled-dates="isWeekend" />
```

`disabled-dates` also takes a list: `:disabled-dates="['2026-12-25', new Date(2026, 0, 1)]"`.
`allowed-dates` is the opposite: only those days can be picked.

## Show the date your way

<Demo>
  <AppDateInput v-model="formatted" label="Custom format" :format-value="(d) => d ? new Date(d).toLocaleDateString('en-GB') : ''" />
</Demo>

```vue
<AppDateInput v-model="date" :format-value="(d) => format(d, 'dd/MM/yyyy')" />
```

By default the date is written in the kit's current language (see [Languages](/languages)). To
have the calendar itself in that language, give the language a `dateLocale` (below).

## Calendar language

```ts
import { ar } from 'date-fns/locale'

createVueKit({ locales: { ar: { dir: 'rtl', dateLocale: ar, messages: { … } } } })
```

When the app switches to `ar`, month and day names in the calendar switch too.

## Keyboard

Enter opens the calendar, the arrow keys move between days, Enter picks, Escape closes. Focus
goes back to the field afterwards.

## More picker features

Every other `@vuepic/vue-datepicker` option works too: just add it.

<Demo>
  <AppDateInput v-model="holiday" label="Holiday" range :multi-calendars="2" />
</Demo>

```vue
<AppDateInput v-model="holiday" range :multi-calendars="2" />  <!-- two months side by side -->
<AppDateInput v-model="date" inline />                          <!-- calendar always open -->
<AppDateInput v-model="date" :locale="ar" />                    <!-- calendar language (date-fns locale) -->
<AppDateInput v-model="date" :preset-dates="presets" />         <!-- quick picks like "Today" -->
```

See all options in the [vue-datepicker docs](https://vue3datepicker.com/props/modes/). Its slots
work too (e.g. `#action-row`, `#day`).

## Your own buttons and icons

```vue
<AppDateInput v-model="date" label="Date">
  <template #leading>📅</template>
  <template #clear="{ clear }">
    <button type="button" aria-label="Clear" @click.stop="clear">✕</button>
  </template>
</AppDateInput>
```

| Slot                  | Gets              | For                                   |
| --------------------- | ----------------- | ------------------------------------- |
| `leading`, `trailing` | `field`           | Icons or buttons before / after the text |
| `clear`               | `clear`, `props`  | Your own clear button                 |
| `label`, `hint`, `errors` | text          | Your own label, hint or error content |

## Props

| Prop                              | What                                                    |
| --------------------------------- | ------------------------------------------------------- |
| `v-model`                         | The value (see the shapes above)                        |
| `mode`                            | `date` (default), `datetime`, `month`, `year`, `week`   |
| `range`                           | Pick a start and an end                                 |
| `min-date`, `max-date`            | First and last day that can be picked                   |
| `disabled-dates`, `allowed-dates` | A list of days, or a function                           |
| `label`, `hint`, `errors`         | As in every input                                       |
| `placeholder`                     | Shown while empty (default "Select date")               |
| `clearable`                       | Show the clear button (default on)                      |
| `format-value`                    | Your own text for the field                             |
| anything else                     | Passed to `@vuepic/vue-datepicker`                      |

**Style keys:** `root` `label` `control` `leading` `trigger` `trailing` `clear` `hint` `errors`.
The calendar itself is styled with the `--dp-*` CSS variables above.
