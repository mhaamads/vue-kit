<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </component>
  <AppInputSkin v-else :field="field" :root-class="rootClass">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </AppInputSkin>
</template>

<script setup lang="ts">
import { reactive, type InputTypeHTMLAttribute } from 'vue'
import { useVueKit } from '../plugin'
import AppInputSkin from './AppInputSkin.vue'
import { useTextInput, type TextInputValue } from './use-text-input'

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
  /** Classes for the wrapper; `class` goes to the <input> itself. */
  rootClass?: string
}>()
const model = defineModel<TextInputValue>()

const field = reactive(
  useTextInput({
    model,
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
  }),
)

const override = useVueKit().components.Input
</script>
