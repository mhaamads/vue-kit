<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </component>
  <AppInputSkin
    v-else
    :field="field"
    :root-class="rootClass"
    :icon="icon"
    :icon-position="iconPosition"
    :icon-config="iconConfig"
    :rounded="rounded"
  >
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </AppInputSkin>
</template>

<script setup lang="ts">
import { reactive, type InputTypeHTMLAttribute } from 'vue'
import type { IconName } from '../icon-names'
import { useVueKit } from '../plugin'
import type { IconType } from '../styles'
import AppInputSkin from './AppInputSkin.vue'
import { useTextInput, type InputMask, type TextInputValue } from './use-text-input'

// Renders, most specific first: this instance's default slot replacing all markup (level 3),
// an app-wide override component (level 4), or the default skin with part slots (levels 1-2).
// All three get the same `field` API. (No comments in the template: they would make it a
// multi-root fragment in dev builds.)
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id?: string
  label?: string
  hint?: string
  errors?: string[]
  type?: InputTypeHTMLAttribute
  as?: 'input' | 'textarea'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  mask?: InputMask
  acceptOnly?: 'numbers' | 'letters' | 'alphanumeric'
  capitalize?: 'first' | 'each'
  displayValue?: string
  copyable?: boolean
  copyValue?: string | number
  // Default skin only:
  /** Classes for the wrapper; `class` goes to the <input> itself. */
  rootClass?: string
  icon?: IconName
  iconPosition?: 'start' | 'end'
  iconConfig?: { color?: string; size?: number | string; type?: IconType }
  rounded?: 'full' | 'lg' | 'xl'
}>()
const model = defineModel<TextInputValue>()
const code = defineModel<string>('code')

const field = reactive(
  useTextInput({
    model,
    code,
    id: () => props.id,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    type: () => props.type,
    as: () => props.as,
    placeholder: () => props.placeholder,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    mask: () => props.mask,
    acceptOnly: () => props.acceptOnly,
    capitalize: () => props.capitalize,
    displayValue: () => props.displayValue,
    copyable: () => props.copyable,
    copyValue: () => props.copyValue,
  }),
)

const override = useVueKit().components.Input
</script>
