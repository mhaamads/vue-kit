<template>
  <div :class="rootMerged">
    <slot name="label" v-bind="field">
      <label v-if="field.label" v-bind="field.labelProps" :class="labelClass">
        {{ field.label
        }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
      </label>
    </slot>
    <div class="relative w-full">
      <slot name="prefix" v-bind="field" />
      <component :is="field.as" v-bind="field.inputProps" :class="controlMerged" />
      <slot name="suffix" v-bind="field" />
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
import type { TextInputField } from './use-text-input'

// The default look of AppInput (ported from portal-iq-vue Input.vue). Export it to reuse the
// default markup inside a global override.
const props = defineProps<{ field: TextInputField; rootClass?: string }>()

const labelClass = 'mb-2 flex text-sm font-medium capitalize dark:text-white'

const rootMerged = computed(() => twMerge('w-full', props.rootClass))

const controlMerged = computed(() =>
  twMerge(
    'w-full rounded-xl border border-neutral-input bg-surface-100 px-3 text-sm font-medium text-black outline-none transition-all duration-300 placeholder:text-base-neutral-300 not-focus:hover:border-base-neutral-400 focus:border-primary-red-700 focus:ring-0 disabled:input-disabled aria-invalid:border-app-error dark:text-white dark:placeholder:text-base-neutral-500 dark:not-focus:hover:border-base-neutral-600',
    props.field.as === 'textarea' ? 'min-h-10 resize-none pt-3' : 'h-10',
    normalizeClass(props.field.inputProps.class),
  ),
)
</script>
