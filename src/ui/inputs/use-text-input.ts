// Text-input behaviour on top of useField (design doc §2), ported from portal-iq-vue Input.vue:
// masks, accept-only filters, capitalisation, number parsing, password toggle, textarea growth,
// copy, and the tel dial code. All of it lives here, so custom UIs get it by binding inputProps.
import {
  computed,
  mergeProps,
  nextTick,
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
import { useVueKit } from '../plugin'
import { useField, type UseFieldOptions } from './use-field'

export type TextInputValue = string | number | null | undefined
export type InputMask = string | MaskOptions

export type UseTextInputOptions = UseFieldOptions<TextInputValue> & {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<InputTypeHTMLAttribute | undefined>
  placeholder?: MaybeRefOrGetter<string | undefined>
  as?: MaybeRefOrGetter<'input' | 'textarea' | undefined>
  /** maska mask, e.g. '##-##-####'. The model holds the masked text (portal). */
  mask?: MaybeRefOrGetter<InputMask | undefined>
  /** Keep only these characters (ASCII, as in portal: passport names are Latin). */
  acceptOnly?: MaybeRefOrGetter<'numbers' | 'letters' | 'alphanumeric' | undefined>
  capitalize?: MaybeRefOrGetter<'first' | 'each' | undefined>
  /** Shown instead of the model value. */
  displayValue?: MaybeRefOrGetter<string | undefined>
  /** Show a copy button; copies `copyValue` or the value. */
  copyable?: MaybeRefOrGetter<boolean | undefined>
  copyValue?: MaybeRefOrGetter<string | number | undefined>
  /** Dial code for type="tel" (`v-model:code`). */
  code?: Ref<string | undefined>
}

const filters = {
  numbers: /[^0-9]/g,
  letters: /[^a-zA-Z]/g,
  alphanumeric: /[^a-zA-Z0-9]/g,
}

/**
 * Call inside the component that renders the input: the component's attrs (class, maxlength,
 * listeners, ...) are merged into `inputProps`, so they land once, on the real control.
 */
export const useTextInput = (options: UseTextInputOptions) => {
  const { messages } = useVueKit()

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

  const as = computed(() => toValue(options.as) ?? 'input')
  const type = computed(() => toValue(options.type) ?? 'text')
  const showPassword = ref(false)
  const copied = ref(false)
  const maskOf = () => {
    const mask = toValue(options.mask)
    return mask ? new Mask(typeof mask === 'string' ? { mask } : mask) : undefined
  }

  const displayValue = computed(() => {
    const shown = toValue(options.displayValue)
    if (shown !== undefined) return shown
    const value = field.value.value
    const raw = value === null || value === undefined ? '' : String(value)
    return maskOf()?.masked(raw) ?? raw
  })

  /** acceptOnly → capitalize → mask, in portal's order. */
  const normalize = (text: string) => {
    const only = toValue(options.acceptOnly)
    let value = only ? text.replace(filters[only], '') : text
    const capitalize = toValue(options.capitalize)
    if (capitalize === 'first') value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    if (capitalize === 'each') value = value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    return maskOf()?.masked(value) ?? value
  }

  const growTextarea = (el: HTMLElement) => {
    if (as.value !== 'textarea') return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const commit = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const value = normalize(el.value)
    // shortcut: caret jumps to the end when a filter or mask changes the text; fine for the
    // typed-at-the-end masks in use (dates, codes). Use maska's MaskInput if mid-text edits matter.
    if (el.value !== value) el.value = value
    field.setValue(type.value === 'number' ? (value === '' ? null : Number(value)) : value)
    growTextarea(el)
  }

  const onInput = async (event: Event) => {
    const el = event.target as HTMLInputElement | HTMLTextAreaElement
    commit(el)
    // Chrome bug #423785: a focused tel input ignores value updates visually until its type
    // changes; flip it to force a repaint (portal).
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
      onInput,
      onFocus,
      onBlur: field.onBlur,
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
    /** Bind to the copy button (copyable only). */
    copyProps: computed(() => ({
      type: 'button' as const,
      'aria-label': copied.value ? messages.copied : messages.copy,
      onClick: copy,
    })),
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

/** What slots and overrides receive: the API with refs unwrapped (`reactive(useTextInput(...))`). */
export type TextInputField = UnwrapNestedRefs<TextInputApi>
