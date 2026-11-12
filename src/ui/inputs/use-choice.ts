// Checkbox, switch, radio-group and checkbox-group behaviour, on native inputs:
// keyboard handling (Space, arrow keys between radios) comes from the browser.
import { computed, onBeforeMount, toValue, type MaybeRefOrGetter, type UnwrapNestedRefs } from 'vue'
import { useField, type UseFieldOptions } from './use-field'

export type ChoiceValue = string | number | boolean
export type ChoiceOption = {
  label: string
  value: ChoiceValue
  disabled?: boolean
  description?: string
}

type Common = {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
}

export type UseChoiceOptions = UseFieldOptions<unknown> &
  Common & {
    description?: MaybeRefOrGetter<string | undefined>
    /** Value mode: the model is `value` when checked and `undefined` when not. */
    value?: MaybeRefOrGetter<unknown>
    /** Model value when checked. Default `true`. */
    trueValue?: MaybeRefOrGetter<unknown>
    /** Model value when unchecked. Default `false`. */
    falseValue?: MaybeRefOrGetter<unknown>
    /** `switch` adds role="switch" and keeps the model at one of the two values. */
    role?: 'checkbox' | 'switch'
  }

/** One checkbox or switch. */
export const useChoice = (options: UseChoiceOptions) => {
  const field = useField({
    ...options,
    hasHint: () => !!toValue(options.hint) || !!toValue(options.hasHint),
    hasDescription: () => !!toValue(options.description) || !!toValue(options.hasDescription),
  })
  const valueMode = () => toValue(options.value) !== undefined
  const on = () => (valueMode() ? toValue(options.value) : (toValue(options.trueValue) ?? true))
  const off = () => (valueMode() ? undefined : (toValue(options.falseValue) ?? false))

  const checked = computed(() => field.value.value === on())
  const toggle = () => {
    if (field.disabled.value || field.readonly.value) return
    field.setValue(checked.value ? off() : on())
  }

  // A switch is always on or off; settle an unknown starting value to "off".
  if (options.role === 'switch') {
    onBeforeMount(() => {
      if (field.value.value !== on() && field.value.value !== off()) field.setValue(off())
    })
  }

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    description: computed(() => toValue(options.description)),
    checked,
    toggle,
    inputProps: computed(() => ({
      ...field.controlAria.value,
      type: 'checkbox' as const,
      role: options.role === 'switch' ? ('switch' as const) : undefined,
      checked: checked.value,
      // Native readonly doesn't apply to checkboxes; block the change instead.
      'aria-readonly': field.readonly.value ? ('true' as const) : undefined,
      onChange: (event: Event) => {
        toggle()
        ;(event.target as HTMLInputElement).checked = checked.value
      },
      onBlur: field.onBlur,
    })),
  }
}

export type UseChoiceGroupOptions = UseFieldOptions<unknown> &
  Common & {
    options: MaybeRefOrGetter<ChoiceOption[]>
    /** Checkbox group (array model) instead of a radio group. */
    multiple?: boolean
    /** Radio group: pick the first option when the model starts empty. Default true. */
    selectFirstOption?: MaybeRefOrGetter<boolean | undefined>
    /** Radio group: clicking the selected option clears the selection. */
    allowSelectionRemoval?: MaybeRefOrGetter<boolean | undefined>
  }

/** A radio group, or a checkbox group with `multiple`. */
export const useChoiceGroup = (options: UseChoiceGroupOptions) => {
  const field = useField({
    ...options,
    hasHint: () => !!toValue(options.hint) || !!toValue(options.hasHint),
  })
  const list = computed(() => toValue(options.options))
  const multiple = !!options.multiple
  const selected = () =>
    Array.isArray(field.value.value) ? (field.value.value as ChoiceValue[]) : []

  // Loose equality, so '1' from a query string matches 1 from the API.
  const same = (a: unknown, b: unknown) => a == b

  const isSelected = (option: ChoiceOption) =>
    multiple ? selected().some((v) => same(v, option.value)) : same(field.value.value, option.value)

  const blocked = (option: ChoiceOption) =>
    field.disabled.value || field.readonly.value || !!option.disabled

  const select = (option: ChoiceOption) => {
    if (blocked(option)) return
    if (multiple) {
      field.setValue(
        isSelected(option)
          ? selected().filter((v) => !same(v, option.value))
          : [...selected(), option.value],
      )
    } else if (isSelected(option)) {
      if (toValue(options.allowSelectionRemoval)) field.setValue(undefined)
    } else {
      field.setValue(option.value)
    }
  }

  onBeforeMount(() => {
    const first = list.value[0]
    if (
      !multiple &&
      first &&
      field.value.value === undefined &&
      toValue(options.selectFirstOption ?? true)
    ) {
      field.setValue(first.value)
    }
  })

  const aria = computed(() => field.controlAria.value)
  const itemId = (index: number) => `${field.id.value}-${index}`

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    options: list,
    multiple,
    isSelected,
    select,
    /** A group has no single control, so the label names the group instead of `for`-linking. */
    labelProps: computed(() => ({ id: field.labelProps.value.id })),
    groupProps: computed(() => ({
      id: field.id.value,
      role: multiple ? ('group' as const) : ('radiogroup' as const),
      'aria-labelledby': toValue(options.label) ? field.labelProps.value.id : undefined,
      'aria-describedby': aria.value['aria-describedby'],
      'aria-invalid': aria.value['aria-invalid'],
      'aria-required': multiple ? undefined : aria.value['aria-required'],
    })),
    itemProps: (option: ChoiceOption, index: number) => ({
      id: itemId(index),
      type: multiple ? ('checkbox' as const) : ('radio' as const),
      // One name per group: the browser then moves between radios with the arrow keys.
      name: field.id.value,
      value: String(option.value),
      checked: isSelected(option),
      disabled: field.disabled.value || !!option.disabled,
      'aria-readonly': field.readonly.value ? ('true' as const) : undefined,
      // On every item too, so <AppForm> can focus the first one.
      'aria-invalid': aria.value['aria-invalid'],
      'aria-describedby': option.description ? `${itemId(index)}-description` : undefined,
      // change covers clicks, Space and arrow keys in every browser.
      onChange: (event: Event) => {
        select(option)
        ;(event.target as HTMLInputElement).checked = isSelected(option)
      },
      // Clicking the already-checked radio fires no change; handle "click again to clear" here.
      onClick: (event: MouseEvent) => {
        if (multiple || !isSelected(option) || !toValue(options.allowSelectionRemoval)) return
        select(option)
        ;(event.target as HTMLInputElement).checked = false
      },
      onBlur: field.onBlur,
    }),
    itemLabelProps: (option: ChoiceOption, index: number) => ({ for: itemId(index) }),
    itemDescriptionProps: (option: ChoiceOption, index: number) => ({
      id: `${itemId(index)}-description`,
    }),
  }
}

export type ChoiceApi = ReturnType<typeof useChoice>
export type ChoiceField = UnwrapNestedRefs<ChoiceApi>
export type ChoiceGroupApi = ReturnType<typeof useChoiceGroup>
export type ChoiceGroupField = UnwrapNestedRefs<ChoiceGroupApi>
