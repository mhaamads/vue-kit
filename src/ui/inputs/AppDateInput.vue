<template>
  <div
    ref="root"
    v-bind="field.dataAttrs"
    :data-mode="mode"
    :class="ui.root"
    @keydown.capture="setKeyHeld(true)"
    @keyup.capture="setKeyHeld(false)"
  >
    <label v-if="label || $slots.label" v-bind="field.labelProps" :class="ui.label">
      <slot name="label" :label="label">{{ label }}</slot>
    </label>
    <VueDatePicker
      v-model="pickerModel"
      :range="range"
      :month-picker="mode === 'month'"
      :year-picker="mode === 'year'"
      :week-picker="mode === 'week'"
      :time-config="{ enableTimePicker: mode === 'datetime' }"
      :min-date="minDate"
      :max-date="maxDate"
      :disabled-dates="disabledDates"
      :allowed-dates="allowedDates"
      :disabled="disabled"
      :readonly="readonly"
      :locale="pickerLocale"
      :teleport="hostReady ? `[data-date-menu='${field.id}']` : false"
      auto-apply
      arrow-navigation
      :floating="{ arrow: false, offset: 6, strategy: 'fixed' }"
      v-bind="$attrs"
      @open="open = true"
      @closed="onClosed"
    >
      <template #trigger>
        <div :class="ui.control">
          <span v-if="$slots.leading" data-leading :class="ui.leading">
            <slot name="leading" :field="field" />
          </span>
          <button ref="trigger" v-bind="triggerProps" type="button" :class="ui.trigger">
            {{ text || placeholderText }}
          </button>
          <span v-if="$slots.trailing" data-trailing :class="ui.trailing">
            <slot name="trailing" :field="field" />
          </span>
          <slot v-if="showClear" name="clear" :clear="clear" :props="clearProps">
            <AppButton v-bind="clearProps" variant="ghost" :class="ui.clear">
              {{ messages.clearDate }}
            </AppButton>
          </slot>
        </div>
      </template>
      <template v-for="name in pickerSlots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </VueDatePicker>
    <!-- The calendar is placed here: still inside this component (so it works in a dialog), but
         outside the picker's trigger area, so Enter on a day can't bubble up and reopen it. -->
    <div :data-date-menu="field.id" />
    <FieldFeedback :field="feedback" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Date input on @vuepic/vue-datepicker (the picker portal-iq-vue uses). The kit draws the field
// (label, trigger, leading / trailing, clear, hint, errors) with `ui` classes; the calendar is the
// picker's own: import '@vuepic/vue-datepicker/dist/main.css' and theme it with its --dp-* CSS
// variables. Every other picker prop and slot (multi-calendars, inline, locale, presets,
// action-row, …) passes straight through.
import { computed, onMounted, reactive, ref, useSlots, useTemplateRef } from 'vue'
import { VueDatePicker, type ModelValue } from '@vuepic/vue-datepicker'
import AppButton from '../AppButton.vue'
import { useVueKit } from '../plugin'
import { useUi, type DateInputUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { formatDateValue, type DateInputValue, type DateLike, type DateMode } from './date-value'
import { useField } from './use-field'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    /** `date`, `datetime`, `month` ({ month, year }), `year` (a number) or `week` ([monday, sunday]). */
    mode?: DateMode
    /** Pick a start and an end: `[start, end]`. */
    range?: boolean
    /** Shown while empty. Default "Select date" from messages. */
    placeholder?: string
    minDate?: DateLike
    maxDate?: DateLike
    /** Days that can't be picked: a list, or a function returning true for a disabled day. */
    disabledDates?: Date[] | string[] | ((date: Date) => boolean)
    /** Only these days can be picked. */
    allowedDates?: Date[] | string[]
    /** Show the clear button while there is a value. */
    clearable?: boolean
    /** Your own text for the trigger, e.g. `(v) => format(v, 'dd/MM/yyyy')`. */
    formatValue?: (value: DateInputValue) => string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Classes per piece; wins over `createVueKit({ ui: { dateInput } })`. */
    ui?: DateInputUi
  }>(),
  { mode: 'date', clearable: true },
)
const model = defineModel<DateInputValue>()

// Our value types are the picker's, written out for apps; the cast only bridges the two names.
const pickerModel = computed({
  get: () => model.value as ModelValue,
  set: (value) => (model.value = value as DateInputValue),
})

const slots = useSlots()
const { messages, locale, dateLocale } = useVueKit()
const ui = useUi('dateInput', () => props.ui)
const field = reactive(
  useField({
    model,
    id: () => props.id,
    errors: () => props.errors,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    hasHint: () => !!props.hint || !!slots.hint,
  }),
)
const feedback = computed(() => ({
  hint: props.hint,
  hintProps: field.hintProps,
  invalid: field.invalid,
  errors: field.errors,
  errorProps: field.errorProps,
}))

const text = computed(() =>
  props.formatValue
    ? props.formatValue(model.value)
    : formatDateValue(model.value, props.mode, locale.value),
)
const placeholderText = computed(() => props.placeholder ?? messages.selectDate)

// The kit stores it as a plain object (date-fns isn't one of our own dependencies).
const pickerLocale = computed(() => dateLocale.value as never)

const open = ref(false)
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const root = useTemplateRef<HTMLElement>('root')

// The calendar holder can be used once it's on the page (not during the first render, e.g.
// with the picker's `inline` option, and not when this field isn't attached to a document).
const hostReady = ref(false)
onMounted(() => (hostReady.value = !!root.value?.isConnected))

// Whether a key is down right now inside this field (calendar included).
let keyHeld = false
const setKeyHeld = (held: boolean) => (keyHeld = held)

// Picking a day (or Escape) closes the calendar, which fades out and takes its focused day with
// it. If focus is still in it (or already lost), send it back to the field; if the user moved
// on somewhere else, leave it there.
const onClosed = () => {
  open.value = false
  field.onBlur()
  const active = document.activeElement
  const lost =
    !active ||
    active === document.body ||
    (root.value?.contains(active) && active !== trigger.value)
  if (!lost) return
  const focusField = () => trigger.value?.focus()
  // Picked with Enter: wait until the key is released, or the browser turns that same Enter
  // into a click on the field and reopens the calendar.
  if (keyHeld) window.addEventListener('keyup', focusField, { once: true })
  else setTimeout(focusField)
}

const triggerProps = computed(() => ({
  ...field.controlAria,
  readonly: undefined,
  type: 'button' as const,
  'aria-haspopup': 'dialog' as const,
  'aria-expanded': open.value,
}))

const clear = () => (model.value = null)
const showClear = computed(
  () => props.clearable && !!text.value && !props.disabled && !props.readonly,
)
const clearProps = computed(() => ({
  'aria-label': messages.clearDate,
  // Inside the picker's trigger: don't let the click open the calendar.
  onClick: (event: MouseEvent) => {
    event.stopPropagation()
    clear()
  },
}))

// The picker's own slots (action-row, day, month-year, …) pass through; ours stay ours.
const own = new Set(['leading', 'trailing', 'clear', 'label', 'hint', 'errors'])
const pickerSlots = computed(() => Object.keys(slots).filter((name) => !own.has(name)))
</script>
