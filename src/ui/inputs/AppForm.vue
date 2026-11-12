<template>
  <form ref="form" novalidate @submit.prevent="submit" @focusout="onFocusout">
    <slot :errors="errors" />
  </form>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
// Validates on submit (or, with validate-on="blur", as the user leaves changed fields), hands
// errors to the fields through the slot, and moves the user to the first invalid control.
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useTemplateRef,
  watch,
  type Ref,
} from 'vue'
import { validate as runValidation } from '../../utils/validation/validate'
import type { FormErrors, Schema } from '../../utils/validation/types'
import { useVueKit } from '../plugin'
import { formKey, type FieldCheck } from './form-context'

const props = withDefaults(
  defineProps<{
    formData: T
    schema?: Schema
    /**
     * `submit` (default): errors appear when the form is submitted. `blur`: also as the user
     * leaves a field they changed, then they update while typing.
     */
    validateOn?: 'submit' | 'blur'
    /** Ask before closing or reloading the page while there are unsaved changes. */
    warnUnsaved?: boolean
  }>(),
  { validateOn: 'submit' },
)
const emit = defineEmits<{ submit: [] }>()

const { messages, locale, devBypassValidation } = useVueKit()
const form = useTemplateRef<HTMLFormElement>('form')
const errors = ref({}) as Ref<FormErrors<T>>

// The starting point for `dirty` and for which fields changed (JSON copy, so proxies work too).
const copy = (value: unknown) => JSON.stringify(value ?? null)
const baseline = ref(copy(props.formData))
const changedKeys = () => {
  const start = JSON.parse(baseline.value) as Record<string, unknown>
  return Object.keys(props.formData).filter((key) => copy(props.formData[key]) !== copy(start[key]))
}
/** True while the data differs from the starting point. */
const dirty = computed(() => copy(props.formData) !== baseline.value)

// Fields inside with their own `rules` (AppInput rules): checked with the form.
const fieldChecks = new Set<FieldCheck>()
provide(formKey, {
  register: (check) => {
    fieldChecks.add(check)
    return () => fieldChecks.delete(check)
  },
})

const submitted = ref(false)
// validate-on="blur": the fields whose errors are on screen before the first submit.
const shown = ref(new Set<string>())

const check = (): FormErrors<T> | undefined => {
  if (!props.schema) return {}
  if (devBypassValidation()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[vue-kit] AppForm validation bypassed by devBypassValidation()')
    }
    return undefined
  }
  return runValidation<T>(props.schema, props.formData, { messages })
}

/**
 * Runs the schema and every field's own `rules`, and shows all errors; true when everything
 * is valid.
 */
const validate = (): boolean => {
  submitted.value = true
  const result = check()
  errors.value = result ?? {}
  if (!result) return true // devBypassValidation()
  // Run every field check (not .every(), which would stop at the first failure).
  const fieldsValid = [...fieldChecks].map((field) => field.validate()).every(Boolean)
  return Object.keys(errors.value).length === 0 && fieldsValid
}

/** Shows errors only for the fields the user has reached (before the first submit). */
const showReached = () => {
  const all = check() ?? {}
  if (submitted.value) {
    errors.value = all
    return
  }
  const visible: Record<string, unknown> = {}
  for (const key of shown.value) {
    const fieldErrors = (all as Record<string, unknown>)[key]
    if (fieldErrors) visible[key] = fieldErrors
  }
  errors.value = visible as FormErrors<T>
}

const onFocusout = () => {
  if (props.validateOn !== 'blur') return
  for (const key of changedKeys()) shown.value.add(key)
  if (shown.value.size || submitted.value) showReached()
}

// Errors on screen follow the data (they go away as soon as the field is fixed).
watch(
  () => copy(props.formData),
  () => {
    if (props.validateOn === 'blur' && (shown.value.size || submitted.value)) showReached()
  },
)

/**
 * Clears every error and makes the current data the starting point (nothing counts as changed
 * or unsaved), e.g. after loading a record into the form.
 */
const resetValidation = () => {
  errors.value = {}
  fieldChecks.forEach((field) => field.reset())
  submitted.value = false
  shown.value = new Set()
  baseline.value = copy(props.formData)
}

// Errors already on screen are re-worded when the language changes.
watch(locale, () => {
  if (Object.keys(errors.value).length) {
    if (props.validateOn === 'blur') showReached()
    else validate()
  }
})

// Every kit input (and any custom UI binding inputProps) marks itself aria-invalid, so this
// works without knowing the markup.
const focusFirstInvalid = () => {
  const control = form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
  control?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  requestAnimationFrame(() => control?.focus({ preventScroll: true }))
}

const submit = async () => {
  if (validate()) {
    // Submitted: the current data is the new starting point for "unsaved changes".
    baseline.value = copy(props.formData)
    return emit('submit')
  }
  await nextTick()
  focusFirstInvalid()
}

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!props.warnUnsaved || !dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

defineExpose({ validate, resetValidation, errors, dirty })
</script>
