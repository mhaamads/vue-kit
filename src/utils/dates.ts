// Ported from portal-iq-vue date-utils. shiftDate replaces its luxon DateBuilder;
// toLocalISOString merges three identical local copies.

export type CalendarDateView = 'month' | 'week' | 'day'

const pad = (n: number) => String(n).padStart(2, '0')

/** `YYYY-MM-DDTHH:mm:ss` in local wall-clock time, no zone suffix. */
export const toLocalISOString = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
  `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

/** UTC midnight (ISO string) of the value's local calendar day. */
export const toUtcMidnight = (value: string | Date): string => {
  const d = new Date(value)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()
}

export const normalizeCalendarDateView = (view?: unknown): CalendarDateView =>
  view === 'week' || view === 'day' ? view : 'month'

/** Moves by whole months, clamping the day to the target month's length (Jan 31 + 1 → Feb 28). */
export const shiftDateMonth = (value: string | Date, amount: number): Date => {
  const d = new Date(value)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + amount)
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  return d
}

/** Adds (or, with negative numbers, subtracts) years, months, then days. Returns a new Date. */
export const shiftDate = (
  value: string | Date,
  { years = 0, months = 0, days = 0 }: { years?: number; months?: number; days?: number },
): Date => {
  const d = shiftDateMonth(value, years * 12 + months)
  d.setDate(d.getDate() + days)
  return d
}

/** Start and end (inclusive, local time) of the month, week (Sunday first) or day around `value`. */
export const getCalendarDateRange = (value: string | Date, view: CalendarDateView) => {
  const start = new Date(value)
  const end = new Date(value)
  start.setHours(0, 0, 0, 0)

  if (view === 'month') {
    start.setDate(1)
    end.setMonth(start.getMonth() + 1, 0)
  } else if (view === 'week') {
    start.setDate(start.getDate() - start.getDay())
    end.setTime(start.getTime())
    end.setDate(start.getDate() + 6)
  }

  end.setHours(23, 59, 59, 999)
  return { start, end }
}
