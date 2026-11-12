<template>
  <div
    v-bind="field.dataAttrs"
    :data-state="field.checked ? 'checked' : 'unchecked'"
    :class="ui.root"
  >
    <label :class="ui.label">
      <input v-bind="field.inputProps" :class="ui.input" />
      <slot name="label" :label="field.label" :checked="field.checked">{{ field.label }}</slot>
    </label>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Switch: a native checkbox with role="switch"; an unknown starting value settles to "off".
// Draw it as a switch with CSS (e.g. appearance-none on `ui.input`), or style it from [data-state].
import { reactive, useSlots } from 'vue'
import { useUi, type CheckboxUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { useChoice } from './use-choice'

const props = defineProps<{
  id?: string
  label?: string
  hint?: string
  errors?: string[]
  /** Model value when checked. Default `true`. */
  trueValue?: unknown
  /** Model value when unchecked. Default `false`. */
  falseValue?: unknown
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** Classes per piece; wins over `createVueKit({ ui: { switch } })`. */
  ui?: CheckboxUi
}>()
const model = defineModel<unknown>()

const slots = useSlots()
const field = reactive(
  useChoice({
    model,
    role: 'switch',
    id: () => props.id,
    hasHint: () => !!slots.hint,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    trueValue: () => props.trueValue,
    falseValue: () => props.falseValue,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)
const ui = useUi('switch', () => props.ui)
</script>
