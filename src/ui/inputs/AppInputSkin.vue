<template>
  <div :class="rootMerged">
    <slot name="label" v-bind="field">
      <label v-if="field.label" v-bind="field.labelProps" :class="labelClass">
        {{ field.label
        }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
      </label>
    </slot>
    <div class="relative w-full">
      <select
        v-if="isTel"
        v-bind="field.codeProps"
        class="absolute inset-y-0 start-0 w-20 border-e border-neutral-default bg-transparent ps-3 text-sm font-medium text-base-neutral-600 outline-none disabled:text-base-neutral-200 dark:text-white"
      >
        <option value="" disabled>+</option>
        <option v-for="[iso, dial, name] in countries" :key="iso" :value="dial" :title="name">
          {{ iso }} {{ dial }}
        </option>
      </select>
      <AppIcon
        v-if="icon"
        :name="icon"
        :size="iconConfig?.size ?? 20"
        :color="iconConfig?.color"
        :type="iconConfig?.type"
        class="pointer-events-none absolute top-1/2 -translate-y-1/2"
        :class="iconPosition === 'end' ? 'end-4' : 'start-4'"
      />
      <slot name="prefix" v-bind="field" />
      <component :is="field.as" v-bind="field.inputProps" :class="controlMerged" />
      <slot name="suffix" v-bind="field">
        <div class="absolute inset-y-0 end-2 flex items-center gap-1">
          <button
            v-if="field.type === 'password'"
            v-bind="field.toggleProps"
            type="button"
            class="grid size-8 place-items-center rounded-lg"
          >
            <AppIcon :name="field.showPassword ? 'Eye' : 'EyeSlash'" :size="20" />
          </button>
          <button
            v-if="field.copyable"
            v-bind="field.copyProps"
            type="button"
            class="grid h-7.25 place-content-center rounded-lg bg-primary-orange-500 px-1.5 text-white hover:bg-primary-orange-700"
          >
            <AppIcon :name="field.copied ? 'CopySuccess' : 'Copy'" :size="20" color="white" />
          </button>
        </div>
      </slot>
    </div>
    <slot name="hint" v-bind="field">
      <p v-if="field.hint" v-bind="field.hintProps" class="mt-1.5 text-xs text-body-muted">
        {{ field.hint }}
      </p>
    </slot>
    <slot name="error" v-bind="field">
      <ul
        v-if="field.invalid"
        v-bind="field.errorProps"
        class="mt-2 grid list-inside list-disc gap-0.5 text-xs text-app-error"
      >
        <li v-for="(message, i) in field.errors" :key="i">{{ message }}</li>
      </ul>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, normalizeClass } from 'vue'
import { twMerge } from 'tailwind-merge'
import AppIcon from '../AppIcon.vue'
import type { IconName } from '../icon-names'
import type { IconType } from '../styles'
import { countries } from './countries'
import type { TextInputField } from './use-text-input'

// The default look of AppInput (ported from portal-iq-vue Input.vue). Export it to reuse the
// default markup inside a global override.
const props = defineProps<{
  field: TextInputField
  rootClass?: string
  icon?: IconName
  iconPosition?: 'start' | 'end'
  iconConfig?: { color?: string; size?: number | string; type?: IconType }
  rounded?: 'full' | 'lg' | 'xl'
}>()

const labelClass = 'mb-2 flex text-sm font-medium capitalize dark:text-white'
const isTel = computed(() => props.field.type === 'tel')

const rootMerged = computed(() => twMerge('w-full', props.rootClass))

const controlMerged = computed(() =>
  twMerge(
    'w-full border border-neutral-input bg-surface-100 px-3 text-sm font-medium text-black outline-none transition-all duration-300 placeholder:text-base-neutral-300 not-focus:hover:border-base-neutral-400 focus:border-primary-red-700 focus:ring-0 disabled:input-disabled aria-invalid:border-app-error dark:text-white dark:placeholder:text-base-neutral-500 dark:not-focus:hover:border-base-neutral-600',
    props.field.as === 'textarea' ? 'min-h-10 resize-none pt-3' : 'h-10',
    props.rounded === 'full'
      ? 'rounded-full'
      : props.rounded === 'lg'
        ? 'rounded-lg'
        : 'rounded-xl',
    props.icon && props.iconPosition !== 'end' ? 'ps-12' : '',
    props.icon && props.iconPosition === 'end' ? 'pe-12' : '',
    isTel.value ? 'ps-22' : '',
    props.field.type === 'password' || props.field.copyable ? 'pe-12' : '',
    normalizeClass(props.field.inputProps.class),
  ),
)
</script>
