// Text-input behaviour on top of useField (design doc §2). Ticket 09 adds masks, filters,
// number parsing, password toggle, textarea growth, copy and tel.
import {
  computed,
  mergeProps,
  onBeforeUpdate,
  ref,
  toValue,
  useAttrs,
  type InputTypeHTMLAttribute,
  type MaybeRefOrGetter,
  type UnwrapNestedRefs,
} from 'vue'
import { useField, type UseFieldOptions } from './use-field'

export type TextInputValue = string | number | null | undefined

export type UseTextInputOptions = UseFieldOptions<TextInputValue> & {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<InputTypeHTMLAttribute | undefined>
  placeholder?: MaybeRefOrGetter<string | undefined>
  as?: MaybeRefOrGetter<'input' | 'textarea' | undefined>
}

/**
 * Call inside the component that renders the input: the component's attrs (class, maxlength,
 * listeners, ...) are merged into `inputProps`, so they land once, on the real control.
 */
export const useTextInput = (options: UseTextInputOptions) => {
  // attrs aren't reactive; bump on every re-render so inputProps picks up new ones.
  const attrs = useAttrs()
  const attrsVersion = ref(0)
  onBeforeUpdate(() => attrsVersion.value++)

  const field = useField({
    ...options,
    hasHint: () => !!toValue(options.hint),
    // Keep the caller's own aria-describedby; mergeProps would otherwise overwrite it.
    describedBy: () => (void attrsVersion.value, attrs['aria-describedby'] as string | undefined),
  })

  const displayValue = computed(() => {
    const value = field.value.value
    return value === null || value === undefined ? '' : String(value)
  })

  const onInput = (event: Event) => {
    field.setValue((event.target as HTMLInputElement | HTMLTextAreaElement).value)
  }

  const inputProps = computed(() => {
    void attrsVersion.value
    return mergeProps(attrs, field.controlAria.value, {
      type: toValue(options.as) === 'textarea' ? undefined : (toValue(options.type) ?? 'text'),
      value: displayValue.value,
      placeholder: toValue(options.placeholder),
      onInput,
      onBlur: field.onBlur,
    })
  })

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    as: computed(() => toValue(options.as) ?? 'input'),
    displayValue,
    inputProps,
  }
}

export type TextInputApi = ReturnType<typeof useTextInput>

/** What slots and overrides receive: the API with refs unwrapped (`reactive(useTextInput(...))`). */
export type TextInputField = UnwrapNestedRefs<TextInputApi>
