// Value shapes of AppDateInput (the same ones @vuepic/vue-datepicker uses) and how they read as text.
export type DateMode = 'date' | 'datetime' | 'month' | 'year' | 'week'
export type MonthValue = { month: number; year: number }
export type DateLike = Date | string | number
export type DateInputValue =
  | DateLike
  | MonthValue
  | [DateLike | null, DateLike | null]
  | DateLike[]
  | null
  | undefined

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

/** The value as text in the given language, e.g. "12 Nov 2026", "November 2026", "1 – 7 Dec 2026". */
export const formatDateValue = (
  value: DateInputValue,
  mode: DateMode,
  language: string,
): string => {
  if (value === null || value === undefined || value === '') return ''
  const format = (date: Date | null, options: Intl.DateTimeFormatOptions) => {
    if (!date) return ''
    try {
      return new Intl.DateTimeFormat(language, options).format(date)
    } catch {
      return new Intl.DateTimeFormat('en', options).format(date)
    }
  }
  if (mode === 'year') return String(value)
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    return format(new Date(value.year, value.month, 1), { month: 'long', year: 'numeric' })
  }
  const options: Intl.DateTimeFormatOptions =
    mode === 'datetime' ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }
  if (Array.isArray(value)) {
    return value
      .map((part) => format(toDate(part), options))
      .filter(Boolean)
      .join(' – ')
  }
  return format(toDate(value as DateLike), options)
}
