// Shared state and ARIA wiring for every input (design doc §1). Components are only skins.
import { computed, ref, toValue, useId, type MaybeRefOrGetter, type Ref } from 'vue'

export type UseFieldOptions<T> = {
  /** The component's defineModel() ref. */
  model: Ref<T>
  /** Falls back to a generated id. */
  id?: MaybeRefOrGetter<string | undefined>
  errors?: MaybeRefOrGetter<string[] | undefined>
  required?: MaybeRefOrGetter<boolean | undefined>
  disabled?: MaybeRefOrGetter<boolean | undefined>
  readonly?: MaybeRefOrGetter<boolean | undefined>
  /** Whether a hint is rendered, so aria-describedby can point at it. */
  hasHint?: MaybeRefOrGetter<boolean | undefined>
  /** Extra ids the control is described by (e.g. the caller's own aria-describedby). */
  describedBy?: MaybeRefOrGetter<string | undefined>
}

const same = (a: unknown, b: unknown) =>
  a === b || (typeof a === 'object' && JSON.stringify(a) === JSON.stringify(b))

export const useField = <T>(options: UseFieldOptions<T>) => {
  const generatedId = useId()
  const id = computed(() => toValue(options.id) || generatedId)
  const errors = computed(() => toValue(options.errors) ?? [])
  const invalid = computed(() => errors.value.length > 0)
  const required = computed(() => !!toValue(options.required))
  const disabled = computed(() => !!toValue(options.disabled))
  const readonly = computed(() => !!toValue(options.readonly))

  const initial = ref(snapshot(options.model.value)) as Ref<T>
  const touched = ref(false)
  const dirty = computed(() => !same(options.model.value, initial.value))

  const ids = computed(() => ({
    label: `${id.value}-label`,
    hint: `${id.value}-hint`,
    error: `${id.value}-error`,
  }))

  return {
    id,
    value: options.model,
    setValue: (value: T) => (options.model.value = value),
    errors,
    error: computed(() => errors.value[0]),
    invalid,
    touched,
    dirty,
    /**
     * Untouched again, with the value back at the baseline. Pass a value to make it the new
     * baseline, e.g. after loading a record into an edit form, so `dirty` starts false.
     */
    reset: (...next: [] | [T]) => {
      if (next.length) initial.value = snapshot(next[0])
      options.model.value = snapshot(initial.value)
      touched.value = false
    },
    disabled,
    readonly,
    required,
    labelProps: computed(() => ({ id: ids.value.label, for: id.value })),
    hintProps: computed(() => ({ id: ids.value.hint })),
    errorProps: computed(() => ({ id: ids.value.error, role: 'alert' as const })),
    /** Spread onto the real control. */
    controlAria: computed(() => ({
      id: id.value,
      'aria-invalid': invalid.value ? ('true' as const) : undefined,
      // aria-required, not `required`: the native attribute would start browser validation
      // popups and block <AppForm>'s own submit handling.
      'aria-required': required.value ? ('true' as const) : undefined,
      'aria-describedby':
        [
          toValue(options.describedBy),
          toValue(options.hasHint) && ids.value.hint,
          invalid.value && ids.value.error,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
      disabled: disabled.value,
      readonly: readonly.value,
    })),
    onBlur: () => (touched.value = true),
  }
}

export type FieldApi<T> = ReturnType<typeof useField<T>>

// Copies the starting value for `dirty` / `reset` (JSON copy, so Vue proxies work too).
function snapshot<T>(value: T): T {
  return value === undefined || value === null || typeof value !== 'object'
    ? value
    : (JSON.parse(JSON.stringify(value)) as T)
}
