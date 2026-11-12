// Text-input behaviour on top of useField: masks, accept-only filters, capitalisation, number
// parsing, password toggle, textarea growth, copy, and the tel dial code. All of it lives here,
// so any markup gets it by binding inputProps.
import {
  watch,
  computed,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  ref,
  toValue,
  useAttrs,
  type InputTypeHTMLAttribute,
  type MaybeRefOrGetter,
  type Ref,
  type UnwrapNestedRefs,
} from 'vue'
import { Mask, type MaskOptions } from 'maska'
import { copyToClipboard } from '../../utils/helpers'
import type { FieldRule } from '../../utils/validation/types'
import { validate } from '../../utils/validation/validate'
import { useVueKit } from '../plugin'
import { useFormField } from './form-context'
import { useField, type UseFieldOptions } from './use-field'

export type TextInputValue = string | number | null | undefined
export type InputMask = string | MaskOptions

export type UseTextInputOptions = UseFieldOptions<TextInputValue> & {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  placeholder?: MaybeRefOrGetter<string | undefined>
  as?: MaybeRefOrGetter<'input' | 'textarea' | undefined>
  type?: MaybeRefOrGetter<InputTypeHTMLAttribute | undefined>
  /** maska mask, e.g. '##-##-####'. The model holds the masked text. */
  mask?: MaybeRefOrGetter<InputMask | undefined>
  /** Keep only these characters (ASCII: e.g. passport names are Latin). */
  acceptOnly?: MaybeRefOrGetter<'numbers' | 'letters' | 'alphanumeric' | undefined>
  capitalize?: MaybeRefOrGetter<'first' | 'each' | undefined>
  /** Shown instead of the model value. */
  displayValue?: MaybeRefOrGetter<string | undefined>
  /** Show a copy button; copies `copyValue` or the shown value. */
  copyable?: MaybeRefOrGetter<boolean | undefined>
  copyValue?: MaybeRefOrGetter<string | number | undefined>
  /** Dial code for type="tel" (`v-model:code`). */
  code?: Ref<string | undefined>
  /** Offer a clear button while there is a value. */
  clearable?: MaybeRefOrGetter<boolean | undefined>
  /** Wait this many ms after the last keystroke before updating the model. */
  debounce?: MaybeRefOrGetter<number | undefined>
  /** Something is in progress (e.g. checking the value): sets aria-busy. */
  loading?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Check this field on its own, with the same rules as a form schema (`{ required: true,
   * isEmail: true }`). It checks first when the user leaves the field, then on every change.
   */
  rules?: MaybeRefOrGetter<FieldRule | undefined>
}

// "Nothing waiting" for the debounce (null and '' are real values).
const NONE = Symbol('none')

const filters = {
  numbers: /[^0-9]/g,
  letters: /[^a-zA-Z]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
}

/**
 * Call inside the component that renders the input: the component's attrs (maxlength,
 * autocomplete, listeners, ...) are merged into `inputProps`, so they land once, on the control.
 */
export const useTextInput = (options: UseTextInputOptions) => {
  const { messages } = useVueKit()

  // attrs aren't reactive; bump on every re-render so inputProps picks up new ones.
  const attrs = useAttrs()
  const attrsVersion = ref(0)
  onBeforeUpdate(() => attrsVersion.value++)

  // Errors from `rules`, next to the ones passed in (e.g. from AppForm).
  const ruleErrors = ref<string[]>([])
  const checked = ref(false)

  const field = useField({
    ...options,
    errors: () => [...(toValue(options.errors) ?? []), ...ruleErrors.value],
    hasHint: () => !!toValue(options.hint) || !!toValue(options.hasHint),
    // Keep the caller's own aria-describedby; mergeProps would otherwise overwrite it.
    describedBy: () => (void attrsVersion.value, attrs['aria-describedby'] as string | undefined),
  })

  const as = computed(() => toValue(options.as) ?? 'input')

  const type = computed(() => toValue(options.type) ?? 'text')
  const showPassword = ref(false)
  const copied = ref(false)
  const maskOf = () => {
    const mask = toValue(options.mask)
    return mask ? new Mask(typeof mask === 'string' ? { mask } : mask) : undefined
  }

  // Debounce: what the user typed but the model doesn't have yet.
  const pending = ref<TextInputValue | typeof NONE>(NONE)
  let timer: ReturnType<typeof setTimeout> | undefined
  // The model when the waiting started: if it changes from outside meanwhile (e.g. a form
  // reset), the outside value wins and what was typed is dropped.
  let modelWhenTyping: TextInputValue
  const flush = () => {
    clearTimeout(timer)
    if (pending.value === NONE) return
    const value = pending.value
    pending.value = NONE
    field.setValue(value)
  }
  onBeforeUnmount(flush)
  watch(field.value, (value) => {
    if (pending.value !== NONE && value !== modelWhenTyping) {
      clearTimeout(timer)
      pending.value = NONE
    }
  })

  const displayValue = computed(() => {
    const shown = toValue(options.displayValue)
    if (shown !== undefined) return shown
    const value = pending.value === NONE ? field.value.value : pending.value
    const raw = value === null || value === undefined ? '' : String(value)
    return maskOf()?.masked(raw) ?? raw
  })

  /** acceptOnly → capitalize → mask. */
  const normalize = (text: string) => {
    const only = toValue(options.acceptOnly)
    let value = only ? text.replace(filters[only], '') : text
    const capitalize = toValue(options.capitalize)
    if (capitalize === 'first') value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    if (capitalize === 'each') value = value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    return maskOf()?.masked(value) ?? value
  }

  const growTextarea = (el: HTMLElement) => {
    if (el.tagName !== 'TEXTAREA') return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const commit = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const value = normalize(el.value)
    // shortcut: caret jumps to the end when a filter or mask changes the text; fine for the
    // typed-at-the-end masks in use (dates, codes). Use maska's MaskInput if mid-text edits matter.
    if (el.value !== value) el.value = value
    const next = type.value === 'number' ? (value === '' ? null : Number(value)) : value
    const wait = toValue(options.debounce)
    if (wait) {
      if (pending.value === NONE) modelWhenTyping = field.value.value
      pending.value = next
      clearTimeout(timer)
      timer = setTimeout(flush, wait)
    } else {
      field.setValue(next)
    }
    growTextarea(el)
  }

  /** Runs `rules` now; returns true when they pass (or there are none). */
  const checkRules = (): boolean => {
    const rules = toValue(options.rules)
    if (!rules) return true
    const label = rules.label ?? toValue(options.label)
    const result = validate(
      { value: { ...rules, label } },
      { value: field.value.value },
      { messages },
    )
    ruleErrors.value = (result.value as string[] | undefined) ?? []
    checked.value = true
    return ruleErrors.value.length === 0
  }
  // Inside an AppForm: checked on submit, cleared on resetValidation().
  useFormField({
    validate: checkRules,
    reset: () => {
      ruleErrors.value = []
      checked.value = false
    },
  })
  // After the first check, follow every change (so the error goes away as soon as it's fixed).
  watch(field.value, () => {
    if (checked.value) checkRules()
  })

  const onBlur = () => {
    flush()
    field.onBlur()
    if (toValue(options.rules)) checkRules()
  }

  const hasValue = computed(() => displayValue.value !== '')
  const clear = () => {
    clearTimeout(timer)
    pending.value = NONE
    field.setValue(null)
  }

  const onInput = async (event: Event) => {
    const el = event.target as HTMLInputElement | HTMLTextAreaElement
    commit(el)
    // Chrome bug #423785: a focused tel input ignores value updates visually until its type
    // changes; flip it to force a repaint.
    if (el instanceof HTMLInputElement && el.type === 'tel') {
      await nextTick()
      el.type = 'text'
      el.value = displayValue.value
      el.type = 'tel'
    }
  }

  const onFocus = (event: FocusEvent) => {
    if (!toValue(options.acceptOnly) && !toValue(options.capitalize)) return
    commit(event.target as HTMLInputElement | HTMLTextAreaElement)
  }

  /** Bind to the <input> or <textarea>. */
  const inputProps = computed(() => {
    void attrsVersion.value
    return mergeProps(attrs, field.controlAria.value, {
      type:
        as.value === 'textarea'
          ? undefined
          : type.value === 'password' && showPassword.value
            ? 'text'
            : type.value,
      value: displayValue.value,
      placeholder: toValue(options.placeholder),
      'aria-busy': toValue(options.loading) || undefined,
      onInput,
      onFocus,
      onBlur,
    })
  })

  const togglePassword = () => (showPassword.value = !showPassword.value)

  const copy = async () => {
    await copyToClipboard(toValue(options.copyValue) ?? displayValue.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }

  const setCode = (dialCode: string) => {
    if (options.code) options.code.value = dialCode
  }

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    as,
    type,
    displayValue,
    inputProps,
    showPassword,
    togglePassword,
    /** Bind to the show/hide password button (type="password" only). */
    toggleProps: computed(() => ({
      type: 'button' as const,
      'aria-label': messages.showPassword,
      'aria-pressed': showPassword.value,
      'aria-controls': field.id.value,
      onClick: togglePassword,
    })),
    copyable: computed(() => !!toValue(options.copyable)),
    copied,
    copy,
    /** Bind to the copy button. */
    copyProps: computed(() => ({
      type: 'button' as const,
      'aria-label': copied.value ? messages.copied : messages.copy,
      onClick: copy,
    })),
    loading: computed(() => !!toValue(options.loading)),
    /** Characters in the field, and the `maxlength` attribute if set (for a counter). */
    count: computed(() => displayValue.value.length),
    maxLength: computed(
      () => (void attrsVersion.value, Number(attrs.maxlength ?? attrs.maxLength) || undefined),
    ),
    clearable: computed(() => !!toValue(options.clearable)),
    hasValue,
    clear,
    /** Bind to the clear button. */
    clearProps: computed(() => ({
      type: 'button' as const,
      'aria-label': messages.clear,
      onClick: clear,
    })),
    /** Runs `rules` now and shows the result; true when valid. */
    validate: checkRules,
    /** Model updates waiting for the debounce happen now. */
    flush,
    code: computed(() => options.code?.value),
    setCode,
    /** Bind to a native <select> of dial codes (type="tel" only). */
    codeProps: computed(() => ({
      id: `${field.id.value}-code`,
      'aria-label': messages.countryCode,
      value: options.code?.value ?? '',
      disabled: field.disabled.value,
      onChange: (event: Event) => setCode((event.target as HTMLSelectElement).value),
    })),
  }
}

export type TextInputApi = ReturnType<typeof useTextInput>

/** The API with refs unwrapped (`reactive(useTextInput(...))`), as components use it. */
export type TextInputField = UnwrapNestedRefs<TextInputApi>
