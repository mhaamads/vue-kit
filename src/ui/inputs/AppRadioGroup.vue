<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field" />
  <div v-else>
    <p
      v-if="field.label"
      v-bind="field.groupLabelProps"
      class="mb-2 flex text-sm font-medium capitalize dark:text-white"
    >
      {{ field.label
      }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
    </p>
    <div
      v-bind="field.groupProps"
      class="flex flex-wrap gap-x-2 gap-y-3"
      :class="direction === 'vertical' ? 'flex-col' : 'flex-row'"
    >
      <label
        v-for="(option, i) in field.options"
        :key="String(option.value)"
        v-bind="field.itemLabelProps(option, i)"
        class="group flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-neutral-input bg-surface-100 ps-1.5 pe-5 has-focus-visible:outline-2 has-focus-visible:outline-primary-orange-500 has-disabled:cursor-not-allowed has-disabled:opacity-60"
      >
        <input v-bind="field.itemProps(option, i)" class="sr-only" />
        <span
          aria-hidden="true"
          class="grid aspect-square h-7 place-content-center rounded-full border border-neutral-input bg-white group-has-checked:border-2 group-has-checked:border-primary-orange-500 dark:bg-base-neutral-800"
        >
          <span
            class="hidden aspect-square w-4.5 rounded-full bg-primary-orange-500 group-has-checked:block"
          />
        </span>
        <span class="text-sm capitalize text-body">{{ option.label }}</span>
        <span
          v-if="option.description"
          v-bind="field.itemDescriptionProps(option, i)"
          class="sr-only"
        >
          {{ option.description }}
        </span>
      </label>
    </div>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import { useChoiceGroup, type ChoiceOption } from './use-choice'

const props = withDefaults(
  defineProps<{
    options: ChoiceOption[]
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    direction?: 'horizontal' | 'vertical'
    /** Pick the first option when the model starts empty (portal default). */
    selectFirstOption?: boolean
    /** Clicking the selected option clears it. */
    allowSelectionRemoval?: boolean
    required?: boolean
    disabled?: boolean
    readonly?: boolean
  }>(),
  { direction: 'horizontal', selectFirstOption: true },
)
const model = defineModel<unknown>()

const field = reactive(
  useChoiceGroup({
    model,
    options: () => props.options,
    id: () => props.id,
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

const override = useVueKit().components.RadioGroup
</script>
