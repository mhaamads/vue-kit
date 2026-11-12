<template>
  <div v-bind="field.dataAttrs" :class="ui.root">
    <label v-if="field.label || $slots.label" v-bind="field.labelProps" :class="ui.label">
      <slot name="label" :label="field.label">{{ field.label }}</slot>
    </label>
    <div :class="ui.control">
      <span v-if="$slots.leading" data-leading :class="ui.leading">
        <slot name="leading" :field="field" />
      </span>
      <CountryCodeSelect
        v-if="field.type === 'tel'"
        :id="`${field.id}-code`"
        :model-value="field.code"
        :disabled="field.disabled"
        :ui="ui"
        @update:model-value="(v) => field.setCode(v as string)"
      />
      <component :is="field.as" v-bind="field.inputProps" :class="ui.input" />
      <span v-if="$slots.trailing" data-trailing :class="ui.trailing">
        <slot name="trailing" :field="field" />
      </span>
      <span v-if="field.loading" role="status" data-loading :class="ui.loading">
        {{ messages.loading }}
      </span>
      <slot
        v-if="field.clearable && field.hasValue && !field.disabled && !field.readonly"
        name="clear"
        :clear="field.clear"
        :props="field.clearProps"
      >
        <AppButton v-bind="field.clearProps" variant="ghost" :class="ui.clear">
          {{ messages.clear }}
        </AppButton>
      </slot>
      <slot
        v-if="field.type === 'password'"
        name="password-toggle"
        :visible="field.showPassword"
        :toggle="field.togglePassword"
        :props="field.toggleProps"
      >
        <AppButton v-bind="field.toggleProps" variant="ghost" :class="ui.passwordToggle">
          {{ field.toggleProps['aria-label'] }}
        </AppButton>
      </slot>
      <slot
        v-if="field.copyable"
        name="copy"
        :copied="field.copied"
        :copy="field.copy"
        :props="field.copyProps"
      >
        <AppButton v-bind="field.copyProps" variant="ghost" :class="ui.copy">
          {{ field.copyProps['aria-label'] }}
        </AppButton>
      </slot>
    </div>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
    <p v-if="counter" data-counter :class="ui.counter">
      {{ field.maxLength ? `${field.count} / ${field.maxLength}` : field.count }}
    </p>
  </div>
</template>

<script setup lang="ts">
// Text input: label, control row (leading, dial code, input, trailing, password / copy buttons),
// hint and errors. Native attributes and listeners go to the <input>; classes come from `ui`.
// Slots: `leading` / `trailing` (icons, your own buttons; they get `field`), and `clear`,
// `password-toggle` / `copy` to replace those buttons (they get the function and `props` to bind).
import { reactive, type InputTypeHTMLAttribute, useSlots } from 'vue'
import AppButton from '../AppButton.vue'
import type { FieldRule } from '../../utils/validation/types'
import { useVueKit } from '../plugin'
import { useUi, type InputUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import CountryCodeSelect from './CountryCodeSelect.vue'
import { useTextInput, type InputMask, type TextInputValue } from './use-text-input'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id?: string
  label?: string
  hint?: string
  errors?: string[]
  type?: InputTypeHTMLAttribute
  /** `textarea` for multi-line text that grows with its content. */
  as?: 'input' | 'textarea'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  /** maska mask, e.g. `'##-##-####'`. The model holds the masked text. */
  mask?: InputMask
  /** Keep only these characters while typing. */
  acceptOnly?: 'numbers' | 'letters' | 'alphanumeric'
  capitalize?: 'first' | 'each'
  /** Shown instead of the model value. */
  displayValue?: string
  /** Show a copy button. */
  copyable?: boolean
  /** What the copy button copies instead of the shown value. */
  copyValue?: string | number
  /** Show a clear button while there is a value; clearing sets the model to null. */
  clearable?: boolean
  /** Show how many characters are typed ("12 / 50" with a `maxlength`). */
  counter?: boolean
  /** Wait this many ms after the last keystroke before updating v-model (e.g. search). */
  debounce?: number
  /** Something is in progress, e.g. checking the value: shows a loading indicator. */
  loading?: boolean
  /**
   * Check this field on its own, with form-schema rules: `{ required: true, isEmail: true }`.
   * It checks when the user leaves the field, then on every change. Off unless you pass it.
   */
  rules?: FieldRule
  /** Classes per piece; wins over `createVueKit({ ui: { input } })`. */
  ui?: InputUi
}>()
const model = defineModel<TextInputValue>()
/** Dial code for `type="tel"`. */
const code = defineModel<string>('code')

const slots = useSlots()
const field = reactive(
  useTextInput({
    model,
    code,
    id: () => props.id,
    hasHint: () => !!slots.hint,
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
    clearable: () => props.clearable,
    debounce: () => props.debounce,
    loading: () => props.loading,
    rules: () => props.rules,
  }),
)
const { messages } = useVueKit()

defineExpose({
  /** Checks `rules` now and shows the result; true when valid. */
  validate: () => field.validate(),
  /** Puts focus in the field. */
  focus: () => document.getElementById(field.id)?.focus(),
})
const ui = useUi('input', () => props.ui)
</script>
