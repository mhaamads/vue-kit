import { describe, expect, it } from 'vitest'
import { DATE_TIME_FORMAT, formatDate } from '@mhaamads/vue-kit/utils'

// Local-time inputs keep the expectations independent of the machine's time zone.
const afternoon = new Date(2026, 0, 5, 14, 7)

describe('formatDate', () => {
  it('defaults to a date-only format (portal-iq-vue default "DD MMM YYYY")', () => {
    expect(formatDate(afternoon)).toBe('05 Jan 2026')
  })

  it('formats date and time with DATE_TIME_FORMAT', () => {
    expect(formatDate(afternoon, DATE_TIME_FORMAT)).toBe('05 Jan 2026, 02:07 PM')
  })

  it('accepts any Day.js-style pattern', () => {
    expect(formatDate(afternoon, 'YYYY-MM-DD HH:mm')).toBe('2026-01-05 14:07')
  })

  it('parses date strings like portal-iq-vue (new Date(string))', () => {
    expect(formatDate('2026-01-05T14:07:00')).toBe('05 Jan 2026')
  })

  it.each([undefined, null, ''])('returns undefined for empty input (%s)', (input) => {
    expect(formatDate(input)).toBeUndefined()
  })

  it('returns undefined for an unparseable string instead of "NaN" text', () => {
    expect(formatDate('not a date')).toBeUndefined()
  })
})
