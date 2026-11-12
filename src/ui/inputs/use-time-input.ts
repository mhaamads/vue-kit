// Time behaviour (design doc §3), ported from portal-iq-vue TimeInput.vue: { hours, minutes }
// model, 12/24 h, minute step, presets, "Now", clear. Fixed vs portal: minTime / maxTime now
// disable out-of-range column options and clamp the result (portal only filtered presets).
import { computed, nextTick, ref, toValue, type MaybeRefOrGetter, type UnwrapNestedRefs } from 'vue'
import { parseTimeString } from '../../utils/helpers'
import { useVueKit } from '../plugin'
import { useField, type UseFieldOptions } from './use-field'

export type TimeValue = { hours: number; minutes: number }
export type TimePreset = { label: string; value: TimeValue }
export type TimeColumnKind = 'hours' | 'minutes' | 'period'
export type TimeOption = { value: number | 'AM' | 'PM'; label: string; disabled: boolean }

export type UseTimeInputOptions = UseFieldOptions<TimeValue | string | null | undefined> & {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  placeholder?: MaybeRefOrGetter<string | undefined>
  format?: MaybeRefOrGetter<12 | 24 | undefined>
  minuteStep?: MaybeRefOrGetter<1 | 5 | 10 | 15 | 30 | undefined>
  /** "HH:mm", 24 h. */
  minTime?: MaybeRefOrGetter<string | undefined>
  maxTime?: MaybeRefOrGetter<string | undefined>
  presets?: MaybeRefOrGetter<TimePreset[] | undefined>
  clearable?: MaybeRefOrGetter<boolean | undefined>
}

const pad = (n: number) => String(n).padStart(2, '0')
const to12 = (h24: number) => ({
  hours: h24 % 12 || 12,
  period: h24 >= 12 ? ('PM' as const) : ('AM' as const),
})
const to24 = (h12: number, period: 'AM' | 'PM') => (h12 % 12) + (period === 'PM' ? 12 : 0)

export const useTimeInput = (options: UseTimeInputOptions) => {
  const { messages } = useVueKit()
  const field = useField({ ...options, hasHint: () => !!toValue(options.hint) })

  const open = ref(false)
  const is12 = computed(() => toValue(options.format) === 12)
  const step = computed(() => toValue(options.minuteStep) ?? 1)

  const time = computed((): TimeValue | null => {
    const v = field.value.value
    if (v === null || v === undefined || v === '') return null
    return parseTimeString(v)
  })

  const limits = computed(() => {
    const bound = (s?: string) => {
      const t = s ? parseTimeString(s) : null
      return t ? t.hours * 60 + t.minutes : undefined
    }
    return {
      min: bound(toValue(options.minTime)) ?? 0,
      max: bound(toValue(options.maxTime)) ?? 24 * 60 - 1,
    }
  })
  const inRange = (total: number) => total >= limits.value.min && total <= limits.value.max
  const clamp = (total: number) => Math.min(Math.max(total, limits.value.min), limits.value.max)

  const set = (total: number) => {
    const t = clamp(total)
    field.setValue({ hours: Math.floor(t / 60), minutes: t % 60 })
  }
  const blocked = () => field.disabled.value || field.readonly.value

  // No time yet counts as midnight, AM (portal: picking 9 in 12 h mode gives 09:00).
  const hours24 = () => time.value?.hours ?? 0
  const minutes = () => time.value?.minutes ?? 0
  const period = computed(() => to12(hours24()).period)

  const hourOptions = computed((): TimeOption[] => {
    const list = is12.value
      ? Array.from({ length: 12 }, (item, i) => i + 1)
      : Array.from({ length: 24 }, (item, i) => i)
    return list.map((h) => {
      const h24 = is12.value ? to24(h, period.value) : h
      // An hour is available if any of its minutes is in range.
      const disabled = h24 * 60 + 59 < limits.value.min || h24 * 60 > limits.value.max
      return { value: h, label: pad(h), disabled }
    })
  })
  const minuteOptions = computed((): TimeOption[] =>
    Array.from({ length: Math.ceil(60 / step.value) }, (item, i) => i * step.value).map((m) => ({
      value: m,
      label: pad(m),
      disabled: !!time.value && !inRange(hours24() * 60 + m),
    })),
  )
  const periodOptions = computed((): TimeOption[] =>
    (['AM', 'PM'] as const).map((p) => ({
      value: p,
      label: p,
      disabled: p === 'AM' ? limits.value.min >= 12 * 60 : limits.value.max < 12 * 60,
    })),
  )
  const columns = computed(() => ({
    hours: hourOptions.value,
    minutes: minuteOptions.value,
    period: periodOptions.value,
  }))

  const selected = (kind: TimeColumnKind): TimeOption['value'] | undefined => {
    if (!time.value) return undefined
    if (kind === 'minutes') return minutes()
    if (kind === 'period') return period.value
    return is12.value ? to12(hours24()).hours : hours24()
  }

  const select = (kind: TimeColumnKind, value: TimeOption['value']) => {
    if (blocked()) return
    if (kind === 'minutes') return set(hours24() * 60 + (value as number))
    if (kind === 'period')
      return set(to24(to12(hours24()).hours, value as 'AM' | 'PM') * 60 + minutes())
    const h24 = is12.value ? to24(value as number, period.value) : (value as number)
    set(h24 * 60 + minutes())
  }

  const presets = computed(() =>
    (toValue(options.presets) ?? []).filter((p) => inRange(p.value.hours * 60 + p.value.minutes)),
  )

  const displayValue = computed(() => {
    const t = time.value
    if (!t) return ''
    if (!is12.value) return `${pad(t.hours)}:${pad(t.minutes)}`
    const { hours, period: p } = to12(t.hours)
    return `${pad(hours)}:${pad(t.minutes)} ${p}`
  })

  // The trigger that opened the panel; Escape and OK send focus back to it, because the panel's
  // buttons (where focus was) disappear with it.
  let trigger: HTMLElement | null = null
  const close = () => {
    const hadFocus = !!document.getElementById(panelId.value)?.contains(document.activeElement)
    open.value = false
    if (hadFocus) trigger?.focus()
  }
  const closeQuietly = () => (open.value = false)
  const toggle = () => {
    if (!blocked()) open.value = !open.value
  }
  const clear = () => {
    if (!blocked()) field.setValue(null)
  }
  const nowMinutes = () => new Date().getHours() * 60 + new Date().getMinutes()

  const panelId = computed(() => `${field.id.value}-panel`)
  const columnLabel = (kind: TimeColumnKind) =>
    kind === 'hours' ? messages.hours : kind === 'minutes' ? messages.minutes : messages.period

  /** Arrow keys move through a column's enabled options and select (radio-group behaviour). */
  const onColumnKeydown = (kind: TimeColumnKind) => (event: KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const list = columns.value[kind]
    const current = list.findIndex((o) => o.value === selected(kind))
    const stepBy = event.key === 'ArrowDown' ? 1 : -1
    for (let n = 1; n <= list.length; n++) {
      const next = list[(((current + stepBy * n) % list.length) + list.length) % list.length]!
      if (next.disabled) continue
      select(kind, next.value)
      const group = event.currentTarget as HTMLElement
      nextTick(() => group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus())
      return
    }
  }

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    time,
    open,
    toggle,
    close,
    is12,
    displayValue,
    placeholder: computed(
      () => toValue(options.placeholder) ?? (is12.value ? 'hh:mm AM' : 'HH:mm'),
    ),
    columns,
    selected,
    select,
    presets,
    isPresetActive: (preset: TimePreset) =>
      time.value?.hours === preset.value.hours && time.value?.minutes === preset.value.minutes,
    selectPreset: (preset: TimePreset) =>
      !blocked() && set(preset.value.hours * 60 + preset.value.minutes),
    /** "Now" is offered only when the current time is inside minTime..maxTime. */
    canSetNow: () => inRange(nowMinutes()),
    setNow: () => !blocked() && set(nowMinutes()),
    clearable: computed(() => toValue(options.clearable) ?? true),
    clear,
    /** Bind to the wrapper around trigger and panel: closes when focus leaves it, or on Escape. */
    rootProps: {
      onFocusout: (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        if (!root.contains(event.relatedTarget as Node | null)) closeQuietly()
      },
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === 'Escape' && open.value) {
          event.preventDefault()
          close()
        }
      },
    },
    /** Bind to the trigger <button>. */
    triggerProps: computed(() => ({
      ...field.controlAria.value,
      type: 'button' as const,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': open.value,
      'aria-controls': panelId.value,
      onClick: (event: MouseEvent) => {
        trigger = event.currentTarget as HTMLElement
        toggle()
      },
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown' && !open.value) {
          event.preventDefault()
          trigger = event.currentTarget as HTMLElement
          toggle()
        }
      },
      onBlur: field.onBlur,
    })),
    panelProps: computed(() => ({
      id: panelId.value,
      role: 'dialog' as const,
      'aria-label': toValue(options.label) ?? messages.time,
    })),
    columnProps: (kind: TimeColumnKind) => ({
      role: 'radiogroup' as const,
      'aria-label': columnLabel(kind),
      onKeydown: onColumnKeydown(kind),
    }),
    optionProps: (kind: TimeColumnKind, option: TimeOption) => {
      const isChecked = option.value === selected(kind)
      const firstEnabled = columns.value[kind].find((o) => !o.disabled)
      const tabbable = isChecked || (selected(kind) === undefined && option === firstEnabled)
      return {
        type: 'button' as const,
        role: 'radio' as const,
        'aria-checked': isChecked,
        tabindex: tabbable ? 0 : -1,
        disabled: option.disabled || field.disabled.value,
        onClick: () => select(kind, option.value),
      }
    },
    clearProps: computed(() => ({
      type: 'button' as const,
      'aria-label': messages.clearTime,
      onClick: clear,
    })),
  }
}

export type TimeInputApi = ReturnType<typeof useTimeInput>
export type TimeInputField = UnwrapNestedRefs<TimeInputApi>
