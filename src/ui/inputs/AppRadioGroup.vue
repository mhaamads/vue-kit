<template>
  <div v-bind="field.dataAttrs" :class="ui.root">
    <p v-if="field.label || $slots.label" :id="field.labelProps.id" :class="ui.label">
      <slot name="label" :label="field.label">{{ field.label }}</slot>
    </p>
    <div v-bind="field.groupProps" :class="ui.group">
      <label
        v-for="(option, i) in field.options"
        :key="String(option.value)"
        v-bind="field.itemLabelProps(option, i)"
        :data-state="field.isSelected(option) ? 'checked' : 'unchecked'"
        :data-disabled="option.disabled || field.disabled ? '' : undefined"
        :class="ui.item"
      >
        <input v-bind="field.itemProps(option, i)" :class="ui.itemInput" />
        <slot name="item" :option="option" :checked="field.isSelected(option)">
          {{ option.label }}
          <small
            v-if="option.description"
            v-bind="field.itemDescriptionProps(option, i)"
            :class="ui.itemDescription"
          >
            {{ option.description }}
          </small>
        </slot>
      </label>
    </div>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Radio group: native radios sharing one name, so the arrow keys move between them.
// Each option is a <label> with data-state / data-disabled, so a whole card can be clickable.
import { reactive, useSlots } from 'vue'
import { useUi, type ChoiceGroupUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { useChoiceGroup, type ChoiceOption } from './use-choice'

const props = withDefaults(
  defineProps<{
    options: ChoiceOption[]
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    /** Pick the first option when the model starts empty. */
    selectFirstOption?: boolean
    /** Clicking the selected option clears it. */
    allowSelectionRemoval?: boolean
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Classes per piece; wins over `createVueKit({ ui: { radioGroup } })`. */
    ui?: ChoiceGroupUi
  }>(),
  { selectFirstOption: true },
)
const model = defineModel<unknown>()

const slots = useSlots()
const field = reactive(
  useChoiceGroup({
    model,
    options: () => props.options,
    id: () => props.id,
    hasHint: () => !!slots.hint,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    selectFirstOption: () => props.selectFirstOption,
    allowSelectionRemoval: () => props.allowSelectionRemoval,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)
const ui = useUi('radioGroup', () => props.ui)
</script>
