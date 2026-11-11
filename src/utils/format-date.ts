import { formatDate as format } from '@vueuse/core'

export const DATE_FORMAT = 'DD MMM YYYY'
export const DATE_TIME_FORMAT = 'DD MMM YYYY, hh:mm A'

/**
 * Formats a date or date string with Day.js-style tokens, in local time.
 * Missing or unparseable input gives `undefined` instead of "NaN" text.
 */
export const formatDate = (date?: string | Date | null, pattern: string = DATE_FORMAT) => {
  if (!date) return undefined
  const value = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(value.getTime())) return undefined
  return format(value, pattern)
}
