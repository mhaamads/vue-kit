<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field" />
  <div v-else>
    <label
      class="flex cursor-pointer gap-2"
      :class="[field.description ? 'items-start' : 'items-center', disabledClass]"
    >
      <input v-bind="field.inputProps" class="peer sr-only" />
      <span
        aria-hidden="true"
        class="grid aspect-square h-5 shrink-0 place-content-center rounded-sm border border-neutral-default bg-surface-200 text-white peer-checked:border-primary-orange-300 peer-checked:bg-primary-orange-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-orange-500 dark:peer-checked:border-primary-orange-500"
      >
        <svg v-if="field.checked" viewBox="0 0 24 24" class="size-3.5" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3" />
        </svg>
      </span>
      <span class="flex flex-col items-start gap-0.5">
        <span class="text-sm font-medium capitalize text-body">{{ field.label }}</span>
        <span
          v-if="field.description"
          v-bind="field.descriptionProps"
          class="text-start text-xs text-base-neutral-600 dark:text-base-neutral-100"
        >
          {{ field.description }}
        </span>
      </span>
    </label>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import { useChoice } from './use-choice'

// Same precedence as AppInput: instance default slot > app-wide override > default skin.
const props = defineProps<{
  id?: string
  label: string
  description?: string
  hint?: string
  errors?: string[]
  /** With `value`, the model is `value` when checked and undefined when not (portal). */
  value?: string | number
  trueValue?: unknown
  falseValue?: unknown
  required?: boolean
  disabled?: boolean
  readonly?: boolean
}>()
const model = defineModel<unknown>()

const field = reactive(
  useChoice({
    model,
    id: () => props.id,
    label: () => props.label,
    description: () => props.description,
    hint: () => props.hint,
    errors: () => props.errors,
    value: () => props.value,
    trueValue: () => props.trueValue,
    falseValue: () => props.falseValue,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)

const override = useVueKit().components.Checkbox
const disabledClass = computed(() => (props.disabled ? 'cursor-not-allowed opacity-60' : ''))
</script>
