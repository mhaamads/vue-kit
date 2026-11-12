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
      class="flex flex-wrap gap-3"
      :class="direction === 'vertical' ? 'flex-col' : 'flex-row'"
    >
      <label
        v-for="(option, i) in field.options"
        :key="String(option.value)"
        v-bind="field.itemLabelProps(option, i)"
        class="group flex cursor-pointer items-start gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-60"
      >
        <input v-bind="field.itemProps(option, i)" class="peer sr-only" />
        <span
          aria-hidden="true"
          class="grid aspect-square h-5 shrink-0 place-content-center rounded-sm border border-neutral-default bg-surface-200 text-white peer-checked:border-primary-orange-300 peer-checked:bg-primary-orange-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-orange-500"
        >
          <svg viewBox="0 0 24 24" class="hidden size-3.5 group-has-checked:block" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3" />
          </svg>
        </span>
        <span class="flex flex-col items-start gap-0.5">
          <span class="text-sm font-medium capitalize text-body">{{ option.label }}</span>
          <span
            v-if="option.description"
            v-bind="field.itemDescriptionProps(option, i)"
            class="text-start text-xs text-base-neutral-600 dark:text-base-neutral-100"
          >
            {{ option.description }}
          </span>
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
    required?: boolean
    disabled?: boolean
    readonly?: boolean
  }>(),
  { direction: 'horizontal' },
)
const model = defineModel<ChoiceOption['value'][]>()

const field = reactive(
  useChoiceGroup({
    model,
    multiple: true,
    options: () => props.options,
    id: () => props.id,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)

const override = useVueKit().components.CheckboxGroup
</script>
