<template>
  <slot v-if="$slots.default" v-bind="slotProps" />
  <component :is="override" v-else-if="override" :field="field" />
  <div v-else :class="rootClass">
    <label
      v-if="field.label"
      v-bind="field.labelProps"
      class="mb-2 flex text-sm font-medium capitalize dark:text-white"
    >
      {{ field.label
      }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
    </label>
    <div class="relative flex items-center gap-2">
      <template v-if="field.range">
        <input v-bind="field.startProps" :class="control" />
        <span aria-hidden="true" class="text-base-neutral-400">–</span>
        <input v-bind="field.endProps" :class="control" />
      </template>
      <input v-else v-bind="field.inputProps" :class="control" />
      <button
        v-if="field.clearable && field.hasValue && !field.disabled"
        v-bind="field.clearProps"
        type="button"
        class="grid size-8 shrink-0 place-items-center rounded-lg text-base-neutral-600 hover:bg-base-neutral-100 dark:text-white dark:hover:bg-base-neutral-700"
      >
        <AppIcon name="CloseCircle" :size="20" />
      </button>
    </div>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import AppIcon from '../AppIcon.vue'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import {
  useDateInput,
  type DateInputField,
  type DateInputValue,
  type DateLike,
  type DateMode,
} from './use-date-input'

// Same precedence as AppInput: instance default slot > app-wide override > default skin.
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    mode?: DateMode
    range?: boolean
    minDate?: DateLike
    maxDate?: DateLike
    allowedDates?: DateLike[]
    disabledDates?: DateLike[]
    clearable?: boolean
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    rootClass?: string
  }>(),
  // Vue casts a missing boolean prop to false, so the portal default must be set here.
  { clearable: true },
)
const model = defineModel<DateInputValue>()

const field = reactive(
  useDateInput({
    model,
    id: () => props.id,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    mode: () => props.mode,
    range: () => props.range,
    minDate: () => props.minDate,
    maxDate: () => props.maxDate,
    allowedDates: () => props.allowedDates,
    disabledDates: () => props.disabledDates,
    clearable: () => props.clearable,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
  }),
)

// Typed alias for the default slot: binding `field` directly trips a vue-tsc inference quirk here.
const slotProps: DateInputField = field
const override = useVueKit().components.DateInput
// color-scheme makes the browser's own picker follow the kit's dark mode.
const control =
  'h-10 w-full rounded-xl border border-neutral-input bg-surface-100 px-3 text-sm font-medium text-black outline-none transition-all duration-300 scheme-light not-focus:hover:border-base-neutral-400 focus:border-primary-red-700 aria-invalid:border-app-error disabled:input-disabled dark:scheme-dark dark:text-white dark:not-focus:hover:border-base-neutral-600'
</script>
