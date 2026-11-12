<template>
  <div
    v-bind="{ ...field.dataAttrs, ...field.rootProps }"
    :data-open="field.open ? '' : undefined"
    :class="ui.root"
  >
    <label v-if="field.label || $slots.label" v-bind="field.labelProps" :class="ui.label">
      <slot name="label" :label="field.label">{{ field.label }}</slot>
    </label>
    <div :class="ui.control">
      <span v-if="$slots.leading" data-leading :class="ui.leading">
        <slot name="leading" :field="field" />
      </span>
      <button v-bind="field.triggerProps" type="button" :class="ui.trigger">
        {{ field.displayValue || field.placeholder }}
      </button>
      <span v-if="$slots.trailing" data-trailing :class="ui.trailing">
        <slot name="trailing" :field="field" />
      </span>
      <slot
        v-if="field.clearable && field.time && !field.disabled"
        name="clear"
        :clear="field.clear"
        :props="field.clearProps"
      >
        <AppButton v-bind="field.clearProps" variant="ghost" :class="ui.clear">
          {{ field.clearProps['aria-label'] }}
        </AppButton>
      </slot>
    </div>
    <div v-if="field.open" v-bind="field.panelProps" data-time-panel :class="ui.panel">
      <div v-if="field.presets.length" :class="ui.presets">
        <AppButton
          v-for="preset in field.presets"
          :key="preset.label"
          variant="ghost"
          :aria-pressed="field.isPresetActive(preset)"
          :class="ui.preset"
          @click="field.selectPreset(preset)"
        >
          {{ preset.label }}
        </AppButton>
      </div>
      <div
        v-for="kind in kinds"
        :key="kind"
        v-bind="field.columnProps(kind)"
        :data-kind="kind"
        :class="ui.column"
      >
        <button
          v-for="option in field.columns[kind]"
          :key="String(option.value)"
          v-bind="field.optionProps(kind, option)"
          type="button"
          :class="ui.option"
        >
          {{ option.label }}
        </button>
      </div>
      <AppButton v-if="field.canSetNow()" variant="ghost" :class="ui.now" @click="field.setNow()">
        {{ messages.now }}
      </AppButton>
      <AppButton variant="primary" :class="ui.ok" @click="field.close()">{{
        messages.ok
      }}</AppButton>
    </div>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Time picker: trigger, panel with presets, hour / minute (/ AM-PM) radio columns, Now and OK.
// Closes on Escape and when focus leaves it. Position the panel with `ui.panel`. Slots:
// `leading` / `trailing` (get `field`), `clear` (gets `clear` and `props`).
import { computed, reactive, useSlots } from 'vue'
import { useVueKit } from '../plugin'
import AppButton from '../AppButton.vue'
import { useUi, type TimeInputUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import {
  useTimeInput,
  type TimeColumnKind,
  type TimePreset,
  type TimeValue,
} from './use-time-input'

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    /** Trigger text while empty. Default "HH:mm" (or "hh:mm AM"). */
    placeholder?: string
    format?: 12 | 24
    minuteStep?: 1 | 5 | 10 | 15 | 30
    /** "HH:mm", 24 h. Earlier options are disabled. */
    minTime?: string
    /** "HH:mm", 24 h. Later options are disabled. */
    maxTime?: string
    presets?: TimePreset[]
    /** Show the clear button while there is a time. */
    clearable?: boolean
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Classes per piece; wins over `createVueKit({ ui: { timeInput } })`. */
    ui?: TimeInputUi
  }>(),
  { clearable: true },
)
const model = defineModel<TimeValue | string | null>()

const slots = useSlots()
const field = reactive(
  useTimeInput({
    model,
    id: () => props.id,
    hasHint: () => !!slots.hint,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    placeholder: () => props.placeholder,
    format: () => props.format,
    minuteStep: () => props.minuteStep,
    minTime: () => props.minTime,
    maxTime: () => props.maxTime,
    presets: () => props.presets,
    clearable: () => props.clearable,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)
const ui = useUi('timeInput', () => props.ui)
const { messages } = useVueKit()
const kinds = computed((): TimeColumnKind[] =>
  field.is12 ? ['hours', 'minutes', 'period'] : ['hours', 'minutes'],
)
</script>
