<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field" />
  <div v-else>
    <label
      v-if="field.label"
      v-bind="field.labelProps"
      class="mb-2 flex text-sm font-medium capitalize dark:text-white"
    >
      {{ field.label
      }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
    </label>
    <!-- One native checkbox with role="switch"; the two labels are the visual (portal look). -->
    <label
      class="inline-flex w-max cursor-pointer gap-1 rounded-xl bg-surface-300 p-1 has-focus-visible:outline-2 has-focus-visible:outline-primary-orange-500 dark:bg-surface-100"
      :class="disabled ? 'cursor-not-allowed opacity-60' : ''"
    >
      <input v-bind="field.inputProps" class="sr-only" />
      <span aria-hidden="true" :class="[option, field.checked ? active : '']">
        <span
          class="h-2.5 rounded-full bg-app-success transition-all"
          :class="field.checked ? 'w-2.5' : 'w-0'"
        />
        {{ onLabel ?? messages.on }}
      </span>
      <span aria-hidden="true" :class="[option, field.checked ? '' : active]">
        <span
          class="h-2.5 rounded-full bg-app-error transition-all"
          :class="field.checked ? 'w-0' : 'w-2.5'"
        />
        {{ offLabel ?? messages.off }}
      </span>
    </label>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import { useChoice } from './use-choice'

const props = defineProps<{
  id?: string
  label?: string
  hint?: string
  errors?: string[]
  /** Default `true`. */
  trueValue?: unknown
  /** Default `false`. */
  falseValue?: unknown
  onLabel?: string
  offLabel?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
}>()
const model = defineModel<unknown>()

const { messages, components } = useVueKit()
const field = reactive(
  useChoice({
    model,
    role: 'switch',
    id: () => props.id,
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

const override = components.Switch
const option = 'relative flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors'
const active = 'bg-white shadow-default dark:bg-base-neutral-800'
</script>
