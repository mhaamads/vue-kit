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
    <div v-bind="field.rootProps" class="relative">
      <button v-bind="field.triggerProps" type="button" :class="trigger">
        <AppIcon
          name="Clock"
          :size="20"
          class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 icon-primary-orange-500"
        />
        <span :class="field.time ? '' : 'text-base-neutral-300'">
          {{ field.displayValue || field.placeholder }}
        </span>
      </button>
      <button
        v-if="field.clearable && field.time && !field.disabled"
        v-bind="field.clearProps"
        type="button"
        class="absolute inset-y-0 end-2 my-auto grid size-7 place-items-center rounded-lg text-base-neutral-600 hover:bg-base-neutral-100 dark:text-white dark:hover:bg-base-neutral-700"
      >
        <AppIcon name="CloseCircle" :size="18" />
      </button>

      <div
        v-if="field.open"
        v-bind="field.panelProps"
        class="absolute start-0 top-full z-dropdown-6 mt-1.5 w-70 select-none rounded-xl border border-neutral-default bg-white p-3 shadow-lg dark:bg-base-neutral-800"
      >
        <div v-if="field.presets.length" class="mb-3 flex flex-wrap gap-1.5">
          <button
            v-for="preset in field.presets"
            :key="preset.label"
            type="button"
            :aria-pressed="field.isPresetActive(preset)"
            class="rounded-lg border border-neutral-input bg-surface-100 px-2.5 py-1 text-xs font-medium text-base-neutral-500 aria-pressed:border-primary-red-700 aria-pressed:bg-primary-red-700 aria-pressed:text-white"
            @click="field.selectPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="flex items-stretch justify-center gap-1">
          <template v-for="kind in kinds" :key="kind">
            <span
              v-if="kind === 'minutes'"
              class="flex items-center px-0.5 text-lg font-bold text-base-neutral-300"
              aria-hidden="true"
              >:</span
            >
            <div
              v-bind="field.columnProps(kind)"
              class="flex h-42.5 [scrollbar-width:none] flex-col overflow-y-auto rounded-lg bg-surface-100 py-1"
            >
              <button
                v-for="option in field.columns[kind]"
                :key="String(option.value)"
                v-bind="field.optionProps(kind, option)"
                type="button"
                class="flex h-8.5 w-12 shrink-0 items-center justify-center rounded-md text-sm font-medium text-base-neutral-500 hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-30 aria-checked:bg-primary-red-700 aria-checked:text-white"
              >
                {{ option.label }}
              </button>
            </div>
          </template>
        </div>

        <div class="mt-3 flex items-center justify-between border-t border-neutral-default pt-2.5">
          <button
            v-if="field.canSetNow()"
            type="button"
            class="text-xs font-medium text-primary-red-700"
            @click="field.setNow()"
          >
            {{ messages.now }}
          </button>
          <span v-else />
          <button
            type="button"
            class="rounded-lg bg-primary-red-700 px-4 py-1.5 text-xs font-semibold text-white"
            @click="field.close()"
          >
            {{ messages.ok }}
          </button>
        </div>
      </div>
    </div>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppIcon from '../AppIcon.vue'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import {
  useTimeInput,
  type TimeColumnKind,
  type TimeInputField,
  type TimePreset,
  type TimeValue,
} from './use-time-input'

// Same precedence as AppInput: instance default slot > app-wide override > default skin.
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    placeholder?: string
    format?: 12 | 24
    minuteStep?: 1 | 5 | 10 | 15 | 30
    minTime?: string
    maxTime?: string
    presets?: TimePreset[]
    clearable?: boolean
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    rootClass?: string
  }>(),
  // Vue casts a missing boolean prop to false, so the portal default must be set here.
  { clearable: true },
)
const model = defineModel<TimeValue | string | null>()

const { messages, components } = useVueKit()
const field = reactive(
  useTimeInput({
    model,
    id: () => props.id,
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
// Typed alias for the default slot (same vue-tsc quirk as AppDateInput).
const slotProps: TimeInputField = field

const override = components.TimeInput
const kinds = computed((): TimeColumnKind[] =>
  field.is12 ? ['hours', 'minutes', 'period'] : ['hours', 'minutes'],
)
const trigger =
  'relative h-10 w-full cursor-pointer rounded-xl border border-neutral-input bg-surface-100 ps-10 pe-9 text-start text-sm font-medium text-black outline-none transition-all duration-300 not-focus:hover:border-base-neutral-400 focus:border-primary-red-700 aria-invalid:border-app-error disabled:input-disabled dark:text-white'
</script>
