// Select behaviour: single / multiple, search, lazy options, keyboard and the WAI-ARIA combobox +
// listbox pattern. Positioning and long-list windowing live in AppSelect.
import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
  type UnwrapNestedRefs,
} from 'vue'
import { useVueKit } from '../plugin'
import { useField, type UseFieldOptions } from './use-field'

/** One option. `V` is the type of its value (what v-model holds). */
export type SelectOption<V = unknown> = {
  label: string
  value: V
  disabled?: boolean
  description?: string
  [key: string]: unknown
}

export type UseSelectOptions = UseFieldOptions<unknown> & {
  options: MaybeRefOrGetter<SelectOption[] | undefined>
  /** `v-model:query`, the search text. */
  query: Ref<string>
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  placeholder?: MaybeRefOrGetter<string | undefined>
  multiple?: MaybeRefOrGetter<boolean | undefined>
  /** Type to filter. Default true. */
  searchable?: MaybeRefOrGetter<boolean | undefined>
  /** Choosing the selected option again clears it. Default true. */
  optionsUnselectable?: MaybeRefOrGetter<boolean | undefined>
  /** Multiple: at most this many picks; the other options are disabled until one is removed. */
  maxValues?: MaybeRefOrGetter<number | undefined>
  loading?: MaybeRefOrGetter<boolean | undefined>
  /** Options load on first open: `onLoadOptions` runs, and the list opens once ready. */
  lazy?: MaybeRefOrGetter<boolean | undefined>
  isOptionsReady?: MaybeRefOrGetter<boolean | undefined>
  onLoadOptions?: () => void
  /** Shown in an empty list before the user has typed. */
  defaultSearchText?: MaybeRefOrGetter<string | undefined>
}

// Loose equality: '1' from a query string matches 1 from the API.
const same = (a: unknown, b: unknown) => a == b

export const useSelect = (options: UseSelectOptions) => {
  const { messages } = useVueKit()
  const field = useField({
    ...options,
    hasHint: () => !!toValue(options.hint) || !!toValue(options.hasHint),
  })

  const open = ref(false)
  const activeIndex = ref(-1)
  const list = computed(() => toValue(options.options) ?? [])
  const multiple = computed(() => !!toValue(options.multiple))
  const searchable = computed(() => toValue(options.searchable) ?? true)
  const unselectable = () => toValue(options.optionsUnselectable) ?? true

  const values = (): unknown[] =>
    Array.isArray(field.value.value) ? (field.value.value as unknown[]) : []
  const isSelected = (option: SelectOption) =>
    multiple.value
      ? values().some((v) => same(v, option.value))
      : same(field.value.value, option.value)

  const selectedOptions = computed(() => list.value.filter(isSelected))
  const atMax = computed(() => {
    const max = toValue(options.maxValues)
    return multiple.value && max !== undefined && values().length >= max
  })
  /** Disabled by itself, or because `maxValues` is reached (picked ones stay removable). */
  const isOptionDisabled = (option: SelectOption) =>
    !!option.disabled || (atMax.value && !isSelected(option))
  const hasValue = computed(() => selectedOptions.value.length > 0)

  /** Searches every field of an option, not just the label. */
  const filteredOptions = computed(() => {
    const q = searchable.value ? options.query.value.trim().toLowerCase() : ''
    if (!q) return list.value
    return list.value.filter((option) =>
      Object.values(option).some((v) => v != null && String(v).toLowerCase().includes(q)),
    )
  })

  const placeholder = computed(
    () =>
      toValue(options.placeholder) ??
      (multiple.value ? messages.selectOptions : messages.selectOption),
  )
  /** The text a closed single select shows. */
  const displayText = computed(() =>
    !multiple.value && selectedOptions.value[0]
      ? selectedOptions.value[0].label
      : placeholder.value,
  )

  const emptyText = computed(() => {
    if (toValue(options.loading)) return messages.loadingOptions
    if (options.query.value) return messages.noResults
    return toValue(options.defaultSearchText) ?? messages.noOptions
  })

  const blocked = () => field.disabled.value || field.readonly.value

  const openList = () => {
    if (blocked() || open.value) return
    if (toValue(options.lazy) && !toValue(options.isOptionsReady)) {
      options.onLoadOptions?.()
      return
    }
    open.value = true
  }
  const close = () => {
    open.value = false
    options.query.value = ''
  }
  const toggle = () => (open.value ? close() : openList())

  // Lazy options: open as soon as they arrive.
  watch(
    () => toValue(options.isOptionsReady),
    (ready) => {
      if (ready && toValue(options.lazy) && !open.value && !blocked()) open.value = true
    },
  )

  watch(open, (isOpen) => {
    // Non-searchable lists start on the selected option, like a native select.
    activeIndex.value =
      isOpen && !searchable.value ? filteredOptions.value.findIndex(isSelected) : -1
  })
  // While searching, the first match is highlighted, so Enter picks it right away.
  watch(options.query, (query) => {
    activeIndex.value = query.trim()
      ? filteredOptions.value.findIndex((option) => !isOptionDisabled(option))
      : -1
  })

  const select = (option: SelectOption) => {
    if (blocked() || isOptionDisabled(option)) return
    if (multiple.value) {
      if (isSelected(option)) {
        if (unselectable()) field.setValue(values().filter((v) => !same(v, option.value)))
      } else {
        field.setValue([...values(), option.value])
      }
      options.query.value = '' // multiple stays open for more picks
    } else {
      field.setValue(isSelected(option) && unselectable() ? null : option.value)
      close()
    }
  }

  /** Removes an option (chip button), whatever optionsUnselectable says. */
  const remove = (option: SelectOption) => {
    if (blocked()) return
    if (multiple.value) field.setValue(values().filter((v) => !same(v, option.value)))
    else if (isSelected(option)) field.setValue(null)
  }

  /** Moves the highlight by `step`, wrapping and skipping disabled options. */
  const move = (step: 1 | -1, from = activeIndex.value) => {
    const items = filteredOptions.value
    for (let n = 1; n <= items.length; n++) {
      const i = (((from + step * n) % items.length) + items.length) % items.length
      if (items[i] && !isOptionDisabled(items[i])) return (activeIndex.value = i)
    }
  }

  const onKeydown = (event: KeyboardEvent) => {
    const key = event.key
    if (!open.value) {
      if (key === 'ArrowDown' || key === 'Enter' || (key === ' ' && !searchable.value)) {
        event.preventDefault()
        openList()
      }
      return
    }
    const items = filteredOptions.value
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault()
      move(key === 'ArrowDown' ? 1 : -1)
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault()
      move(key === 'Home' ? 1 : -1, key === 'Home' ? -1 : items.length)
    } else if (key === 'Enter' || (key === ' ' && !searchable.value)) {
      event.preventDefault()
      const option = items[activeIndex.value]
      if (option) select(option)
    } else if (key === 'Escape') {
      event.preventDefault()
      close()
    } else if (key === 'Tab') {
      close()
    }
  }

  const listboxId = computed(() => `${field.id.value}-listbox`)
  const optionId = (index: number) => `${field.id.value}-option-${index}`

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    open,
    toggle,
    openList,
    close,
    query: options.query,
    multiple,
    searchable,
    loading: computed(() => !!toValue(options.loading)),
    filteredOptions,
    selectedOptions,
    hasValue,
    placeholder,
    displayText,
    emptyText,
    activeIndex,
    isSelected,
    isOptionDisabled,
    /** Multiple: `maxValues` is reached. */
    atMax,
    select,
    remove,
    /**
     * Bind to the focusable trigger: an <input> when `searchable`, otherwise any element
     * (it gets tabindex=0). Owns the keyboard; closes on blur.
     */
    triggerProps: computed(() => ({
      ...field.controlAria.value,
      role: 'combobox' as const,
      'aria-haspopup': 'listbox' as const,
      'aria-expanded': open.value,
      'aria-controls': listboxId.value,
      'aria-activedescendant':
        open.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
      ...(searchable.value
        ? {
            type: 'text',
            autocomplete: 'off',
            'aria-autocomplete': 'list' as const,
            // Closed: the selection; open: what the user types (selection shows as placeholder).
            value: open.value
              ? options.query.value
              : multiple.value
                ? ''
                : (selectedOptions.value[0]?.label ?? ''),
            placeholder:
              open.value && hasValue.value && !multiple.value
                ? displayText.value
                : placeholder.value,
            onInput: (event: Event) => {
              options.query.value = (event.target as HTMLInputElement).value
              openList()
            },
          }
        : {
            // A <div> can't be named by <label for> or take `disabled` / `readonly`: name it
            // by the label and announce the state with ARIA instead.
            tabindex: field.disabled.value ? -1 : 0,
            disabled: undefined,
            readonly: undefined,
            'aria-disabled': field.disabled.value || undefined,
            'aria-readonly': field.readonly.value || undefined,
            'aria-labelledby': toValue(options.label) ? field.labelProps.value.id : undefined,
          }),
      // A searchable input stays open on click, so the user can place the caret while searching.
      onClick: () => (searchable.value ? openList() : toggle()),
      onKeydown,
      onBlur: () => {
        field.onBlur()
        close()
      },
    })),
    /** Bind to the dropdown container: pressing it (e.g. its scrollbar) must not blur the trigger. */
    popupProps: { onMousedown: (event: MouseEvent) => event.preventDefault() },
    listboxProps: computed(() => ({
      id: listboxId.value,
      role: 'listbox' as const,
      'aria-multiselectable': multiple.value || undefined,
      'aria-label': toValue(options.label) ?? placeholder.value,
    })),
    optionProps: (option: SelectOption, index: number) => ({
      id: optionId(index),
      role: 'option' as const,
      'aria-selected': isSelected(option),
      'aria-disabled': isOptionDisabled(option) || undefined,
      'data-active': index === activeIndex.value || undefined,
      // Keep focus on the trigger, so its blur doesn't close the list before the click.
      onMousedown: (event: MouseEvent) => event.preventDefault(),
      onClick: () => select(option),
      onMouseenter: () => {
        if (!isOptionDisabled(option)) activeIndex.value = index
      },
    }),
    /** Bind to a chip's remove button. */
    removeProps: (option: SelectOption) => ({
      type: 'button' as const,
      'aria-label': messages.removeOption(option.label),
      disabled: field.disabled.value || !!option.disabled,
      onMousedown: (event: MouseEvent) => event.preventDefault(),
      onClick: (event: MouseEvent) => {
        event.stopPropagation()
        remove(option)
      },
    }),
  }
}

export type SelectApi = ReturnType<typeof useSelect>
export type SelectField = UnwrapNestedRefs<SelectApi>
