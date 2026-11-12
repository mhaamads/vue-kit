<template>
  <div
    v-bind="field.dataAttrs"
    :data-complete="value.length === length ? '' : undefined"
    :class="ui.root"
  >
    <label v-if="label || $slots.label" v-bind="field.labelProps" :class="ui.label">
      <slot name="label" :label="label">{{ label }}</slot>
    </label>
    <!-- One real input over the boxes: paste, SMS auto-fill, backspace and screen readers all
         work natively. The inline styles are behaviour (an invisible input on top). -->
    <div dir="ltr" :style="{ position: 'relative' }" :class="ui.control">
      <input ref="input" v-bind="inputProps" :style="hiddenInput" :class="ui.input" />
      <div
        v-for="(char, i) in cells"
        :key="i"
        aria-hidden="true"
        data-cell
        :data-filled="char ? '' : undefined"
        :data-active="focused && i === active ? '' : undefined"
        :class="ui.cell"
      >
        {{ char }}
      </div>
    </div>
    <FieldFeedback :field="feedback" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts">
// Code / PIN input: `length` boxes for a one-time code. Digits only; Arabic-Indic and Persian
// digits are turned into 0-9. Emits `complete` with the code once every box is filled.
import { computed, reactive, ref, useSlots, useTemplateRef, type CSSProperties } from 'vue'
import { useUi, type PinInputUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { useField } from './use-field'

const props = withDefaults(
  defineProps<{
    /** How many characters the code has. */
    length?: number
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Classes per piece; wins over `createVueKit({ ui: { pinInput } })`. */
    ui?: PinInputUi
  }>(),
  { length: 6 },
)
const emit = defineEmits<{ complete: [code: string] }>()
const model = defineModel<string | null>()

const slots = useSlots()
const ui = useUi('pinInput', () => props.ui)
const field = reactive(
  useField({
    model,
    id: () => props.id,
    errors: () => props.errors,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    hasHint: () => !!props.hint || !!slots.hint,
  }),
)
const feedback = computed(() => ({
  hint: props.hint,
  hintProps: field.hintProps,
  invalid: field.invalid,
  errors: field.errors,
  errorProps: field.errorProps,
}))

// Shown cleaned too, so a value set from code ("12-34", "١٢٣٤") looks like a typed one.
const value = computed(() => normalize(String(model.value ?? '')))
const cells = computed(() =>
  Array.from({ length: props.length }, (item, i) => value.value[i] ?? ''),
)
const active = computed(() => Math.min(value.value.length, props.length - 1))
const focused = ref(false)
const input = useTemplateRef<HTMLInputElement>('input')

/** ٠-٩ (Arabic-Indic) and ۰-۹ (Persian) → 0-9, then digits only, cut to `length`. */
function normalize(text: string) {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '')
    .slice(0, props.length)
}

// Typing always continues at the end, like separate boxes would.
const caretToEnd = (el: HTMLInputElement) => el.setSelectionRange(el.value.length, el.value.length)

const onInput = (event: Event) => {
  const el = event.target as HTMLInputElement
  const code = normalize(el.value)
  if (el.value !== code) el.value = code
  field.setValue(code)
  caretToEnd(el)
  if (code.length === props.length) emit('complete', code)
}

const hiddenInput: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
  opacity: 0,
  border: 0,
  padding: 0,
  // 16px stops iOS from zooming in on focus.
  fontSize: '16px',
}

const inputProps = computed(() => ({
  ...field.controlAria,
  value: value.value,
  type: 'text',
  inputmode: 'numeric' as const,
  autocomplete: 'one-time-code',
  // No maxlength: the browser would cut a pasted "Your code: 123-456" before we clean it.
  // normalize() keeps the length instead.
  spellcheck: false,
  onInput,
  onFocus: (event: FocusEvent) => {
    focused.value = true
    caretToEnd(event.target as HTMLInputElement)
  },
  onClick: (event: MouseEvent) => caretToEnd(event.target as HTMLInputElement),
  onKeyup: (event: KeyboardEvent) => caretToEnd(event.target as HTMLInputElement),
  onBlur: () => {
    focused.value = false
    field.onBlur()
  },
}))

defineExpose({
  /** Puts focus in the code, e.g. after clearing a wrong one. */
  focus: () => input.value?.focus(),
})
</script>
