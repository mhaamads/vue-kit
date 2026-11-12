// Date behaviour on the browser's native inputs (ADR-0010: no date-picker library). Models keep
// the shapes portal's @vuepic/vue-datepicker emitted: Date, { month, year }, [monday, sunday],
// or [start, end] for ranges. Allowed / disabled dates can't be greyed out in a native picker,
// so a forbidden pick is rejected and reported through the field's errors.
import { computed, ref, toValue, watch, type MaybeRefOrGetter, type UnwrapNestedRefs } from 'vue'
import { useVueKit } from '../plugin'
import { useField, type UseFieldOptions } from './use-field'

export type DateMode = 'date' | 'datetime' | 'month' | 'week'
export type MonthValue = { month: number; year: number }
export type DateLike = Date | string | number
export type DateInputValue =
  | DateLike
  | MonthValue
  | [DateLike | null, DateLike | null]
  | DateLike[]
  | null
  | undefined

export type UseDateInputOptions = UseFieldOptions<DateInputValue> & {
  label?: MaybeRefOrGetter<string | undefined>
  hint?: MaybeRefOrGetter<string | undefined>
  mode?: MaybeRefOrGetter<DateMode | undefined>
  /** Two inputs, [start, end]; date and datetime modes. */
  range?: MaybeRefOrGetter<boolean | undefined>
  minDate?: MaybeRefOrGetter<DateLike | undefined>
  maxDate?: MaybeRefOrGetter<DateLike | undefined>
  /** Only these days can be chosen. */
  allowedDates?: MaybeRefOrGetter<DateLike[] | undefined>
  /** These days can't be chosen. */
  disabledDates?: MaybeRefOrGetter<DateLike[] | undefined>
  /** Show a clear button (portal default true). */
  clearable?: MaybeRefOrGetter<boolean | undefined>
}

const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** `YYYY-MM-DD` is read as a local day (new Date() would read it as UTC midnight). */
export const toDate = (value: DateLike | null | undefined): Date | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/)
    if (m) return new Date(+m[1]!, +m[2]! - 1, +m[3]!, +(m[4] ?? 0), +(m[5] ?? 0))
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// ISO 8601 weeks (Monday first), for <input type="week">.
const isoWeek = (date: Date) => {
  // Standard algorithm: the ISO week is the one holding this week's Thursday (UTC avoids DST).
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${pad(week)}`
}
const weekRange = (value: string): [Date, Date] => {
  const [year, week] = value.split('-W').map(Number) as [number, number]
  const jan4 = new Date(year, 0, 4)
  const monday = new Date(year, 0, 4 - ((jan4.getDay() + 6) % 7) + (week - 1) * 7)
  return [monday, new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)]
}

export const useDateInput = (options: UseDateInputOptions) => {
  const { messages } = useVueKit()
  const rejected = ref(false)
  const field = useField({
    ...options,
    hasHint: () => !!toValue(options.hint),
    errors: () => [
      ...(toValue(options.errors) ?? []),
      ...(rejected.value ? [messages.dateNotAllowed] : []),
    ],
  })

  // A new model (e.g. a form reset) drops the "not available" error from an earlier pick.
  watch(
    () => field.value.value,
    () => (rejected.value = false),
  )

  const mode = computed(() => toValue(options.mode) ?? 'date')
  const range = computed(
    () => !!toValue(options.range) && (mode.value === 'date' || mode.value === 'datetime'),
  )
  const type = computed(() => (mode.value === 'datetime' ? 'datetime-local' : mode.value))

  /** Date → the native input's value format. */
  const toInput = (value: DateLike | null | undefined) => {
    const d = toDate(value)
    if (!d) return ''
    if (mode.value === 'datetime') return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    if (mode.value === 'month') return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
    if (mode.value === 'week') return isoWeek(d)
    return dayKey(d)
  }

  const allowed = (date: Date) => {
    const allow = toValue(options.allowedDates)
    const deny = toValue(options.disabledDates)
    const key = dayKey(date)
    if (allow?.length && !allow.some((d) => toDate(d) && dayKey(toDate(d)!) === key)) return false
    return !deny?.some((d) => toDate(d) && dayKey(toDate(d)!) === key)
  }

  const parts = computed((): [DateLike | null, DateLike | null] => {
    const v = field.value.value
    return Array.isArray(v) ? [v[0] ?? null, v[1] ?? null] : [null, null]
  })

  const singleValue = computed(() => {
    const v = field.value.value
    if (mode.value === 'month' && v && typeof v === 'object' && 'month' in v) {
      return `${v.year}-${pad(v.month + 1)}`
    }
    if (mode.value === 'week') return Array.isArray(v) ? toInput(v[0]) : toInput(v as DateLike)
    return Array.isArray(v) || (v && typeof v === 'object' && !(v instanceof Date))
      ? ''
      : toInput(v as DateLike)
  })

  /** Native value → model; a day outside allowed/disabled dates is rejected. */
  const commit = (raw: string, el: HTMLInputElement, slot?: 0 | 1) => {
    rejected.value = false
    if (!raw) {
      field.setValue(
        slot === undefined ? null : slot === 0 ? [null, parts.value[1]] : [parts.value[0], null],
      )
      return
    }
    if (mode.value === 'month') {
      const [year, month] = raw.split('-').map(Number) as [number, number]
      return field.setValue({ year, month: month - 1 })
    }
    if (mode.value === 'week') return field.setValue(weekRange(raw))

    const date = toDate(raw)!
    // Native min/max only limit the picker; a typed date can still fall outside. Native values
    // (YYYY-MM-DD, YYYY-MM-DDTHH:mm) sort as strings, so compare them directly.
    const lower = [bound.value.min, slot === 1 ? toInput(parts.value[0]) : '']
      .filter(Boolean)
      .sort()
      .at(-1)
    const upper = [bound.value.max, slot === 0 ? toInput(parts.value[1]) : '']
      .filter(Boolean)
      .sort()[0]
    if (!allowed(date) || (lower && raw < lower) || (upper && raw > upper)) {
      rejected.value = true
      el.value = slot === undefined ? singleValue.value : toInput(parts.value[slot])
      return
    }
    if (slot === undefined) field.setValue(date)
    else
      field.setValue(slot === 0 ? [date, toDate(parts.value[1])] : [toDate(parts.value[0]), date])
  }

  const bound = computed(() => ({
    min: toInput(toValue(options.minDate)) || undefined,
    max: toInput(toValue(options.maxDate)) || undefined,
  }))

  const base = computed(() => ({
    ...field.controlAria.value,
    type: type.value,
    onBlur: field.onBlur,
  }))

  const hasValue = computed(() =>
    range.value ? parts.value.some((p) => toDate(p)) : singleValue.value !== '',
  )

  const clear = () => {
    rejected.value = false
    field.setValue(range.value ? [null, null] : null)
  }

  return {
    ...field,
    label: computed(() => toValue(options.label)),
    hint: computed(() => toValue(options.hint)),
    mode,
    range,
    hasValue,
    clearable: computed(() => toValue(options.clearable) ?? true),
    clear,
    /** Bind to the <input> (single mode). */
    inputProps: computed(() => ({
      ...base.value,
      ...bound.value,
      value: singleValue.value,
      onChange: (e: Event) =>
        commit((e.target as HTMLInputElement).value, e.target as HTMLInputElement),
    })),
    /** Range: the start input; its max follows the end. */
    startProps: computed(() => ({
      ...base.value,
      min: bound.value.min,
      max: toInput(parts.value[1]) || bound.value.max,
      value: toInput(parts.value[0]),
      'aria-label': messages.startDate,
      onChange: (e: Event) =>
        commit((e.target as HTMLInputElement).value, e.target as HTMLInputElement, 0),
    })),
    /** Range: the end input; its min follows the start. */
    endProps: computed(() => ({
      ...base.value,
      id: `${field.id.value}-end`,
      min: toInput(parts.value[0]) || bound.value.min,
      max: bound.value.max,
      value: toInput(parts.value[1]),
      'aria-label': messages.endDate,
      onChange: (e: Event) =>
        commit((e.target as HTMLInputElement).value, e.target as HTMLInputElement, 1),
    })),
    /** Bind to the clear button. */
    clearProps: computed(() => ({
      type: 'button' as const,
      'aria-label': messages.clearDate,
      disabled: field.disabled.value,
      onClick: clear,
    })),
  }
}

export type DateInputApi = ReturnType<typeof useDateInput>
export type DateInputField = UnwrapNestedRefs<DateInputApi>
