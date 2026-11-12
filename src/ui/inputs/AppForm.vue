<template>
  <form ref="form" novalidate @submit.prevent="submit">
    <slot :errors="errors" />
  </form>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
// Ported from portal-iq-vue Form.vue: validates on submit, hands errors to the fields through
// the slot, and moves the user to the first invalid control.
import { nextTick, ref, useTemplateRef, type Ref } from 'vue'
import { validate as runValidation } from '../../utils/validation/validate'
import type { FormErrors, Schema } from '../../utils/validation/types'
import { useVueKit } from '../plugin'

const props = defineProps<{ formData: T; schema?: Schema }>()
const emit = defineEmits<{ submit: [] }>()

const { messages, devBypassValidation } = useVueKit()
const form = useTemplateRef<HTMLFormElement>('form')
const errors = ref({}) as Ref<FormErrors<T>>

/** Runs the schema; fills `errors` and returns true when the form is valid. */
const validate = (): boolean => {
  errors.value = {}
  if (!props.schema) return true
  if (devBypassValidation()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[vue-kit] AppForm validation bypassed by devBypassValidation()')
    }
    return true
  }
  errors.value = runValidation<T>(props.schema, props.formData, { messages })
  return Object.keys(errors.value).length === 0
}

// Every kit input (and any custom UI binding inputProps) marks itself aria-invalid, so this
// works without knowing the markup.
const focusFirstInvalid = () => {
  const control = form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
  control?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  requestAnimationFrame(() => control?.focus({ preventScroll: true }))
}

const submit = async () => {
  if (validate()) return emit('submit')
  await nextTick()
  focusFirstInvalid()
}

defineExpose({ validate, errors })
</script>
