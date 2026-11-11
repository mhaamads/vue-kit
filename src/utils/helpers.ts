// Ported from portal-iq-vue utils/index.ts, with three fixes marked below.

type Time = { hours: number; minutes: number }

/** JSON deep copy. Works on Vue reactive proxies (structuredClone throws on them); drops functions and turns Dates into strings. */
export const deepClone = <T>(value: T): T =>
  value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T)

const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' })
const suffixes: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' }

/** English ordinal suffix for a number: 1 → "st", 21 → "st" (fix: portal returned "th" from 4 up). */
export const ordinalSuffix = (n: number): string => suffixes[ordinalRules.select(n)] ?? 'th'

/** Copies a string, number or comma-joined array. Resolves when the clipboard write finishes. */
export const copyToClipboard = async (value?: string | number | Array<string | number>) => {
  if (typeof value === 'string' || typeof value === 'number')
    return navigator.clipboard.writeText(String(value))
  if (Array.isArray(value)) return navigator.clipboard.writeText(value.join(', '))
  console.warn('copyToClipboard: unsupported value', value)
}

/** Reads `"HHmm"`, `"Hmm"` or `"HH:mm"` (fix: portal parsed "HH:mm" as NaN). */
export const parseTimeString = (time: string | Time | null | undefined): Time => {
  if (!time) return { hours: 0, minutes: 0 }
  if (typeof time === 'object') return time
  const digits = time.replace(':', '').padStart(4, '0')
  return { hours: parseInt(digits.slice(0, 2), 10), minutes: parseInt(digits.slice(2, 4), 10) }
}

/** `"HH:mm"`, or `''` for no time. */
export const formatTime = (time?: string | Time | null): string => {
  if (!time) return ''
  const { hours, minutes } = parseTimeString(time)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Swaps keys and values: `{ A: 'x' }` → `{ x: 'A' }`. */
export const invertObject = <T extends Record<string, string | number>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [String(value), key])) as Record<
    string,
    keyof T
  >

/** Number from a string or number; `undefined` for empty or non-numeric (fix: portal also dropped 0). */
export const toNumber = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(num) ? undefined : num
}
