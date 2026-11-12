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
    <p
      v-if="field.description || $slots.description"
      v-bind="field.descriptionProps"
      data-description
      :class="ui.description"
    >
      <slot name="description" :description="field.description">{{ field.description }}</slot>
    </p>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Checkbox: a native checkbox inside its label, so Space and focus come from the browser.
import { reactive, useSlots } from 'vue'
import { useUi, type CheckboxUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { useChoice } from './use-choice'

const props = defineProps<{
  id?: string
  label?: string
  hint?: string
  errors?: string[]
  /** Text under the checkbox; describes it. */
  description?: string
  /** With `value`, the model is `value` when checked and `undefined` when not. */
  value?: string | number
  /** Model value when checked. Default `true`. */
  trueValue?: unknown
  /** Model value when unchecked. Default `false`. */
  falseValue?: unknown
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** Classes per piece; wins over `createVueKit({ ui: { checkbox } })`. */
  ui?: CheckboxUi
}>()
const model = defineModel<unknown>()

const slots = useSlots()
const field = reactive(
  useChoice({
    model,
    id: () => props.id,
    hasHint: () => !!slots.hint,
    hasDescription: () => !!slots.description,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    description: () => props.description,
    value: () => props.value,
    trueValue: () => props.trueValue,
    falseValue: () => props.falseValue,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)
const ui = useUi('checkbox', () => props.ui)
</script>
