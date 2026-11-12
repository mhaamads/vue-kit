import { describe, expect, it } from 'vitest'
import {
  getCalendarDateRange,
  normalizeCalendarDateView,
  shiftDate,
  shiftDateMonth,
  toLocalISOString,
  toUtcMidnight,
} from '@mhaamads/vue-kit/utils'

// Cases from portal-iq-vue's date-utils.spec.ts, plus the helpers that replace its
// luxon-based DateBuilder and three local toLocalISOString copies.

describe('shiftDateMonth (portal)', () => {
  it('keeps the day anchor when shifting months', () => {
    expect(shiftDateMonth(new Date(2026, 6, 30), 1)).toEqual(new Date(2026, 7, 30))
  })

  it('clamps the day anchor for shorter months', () => {
    expect(shiftDateMonth(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28))
  })

  it('does not mutate its input', () => {
    const input = new Date(2026, 0, 31)
    shiftDateMonth(input, 1)
    expect(input).toEqual(new Date(2026, 0, 31))
  })
})

describe('getCalendarDateRange / normalizeCalendarDateView (portal)', () => {
  it('returns week and month ranges from the active date', () => {
    expect(getCalendarDateRange(new Date(2026, 6, 30), 'week')).toEqual({
      start: new Date(2026, 6, 26, 0, 0, 0, 0),
      end: new Date(2026, 7, 1, 23, 59, 59, 999),
    })
    expect(getCalendarDateRange(new Date(2026, 6, 30), 'month')).toEqual({
      start: new Date(2026, 6, 1, 0, 0, 0, 0),
      end: new Date(2026, 6, 31, 23, 59, 59, 999),
    })
  })

  it('returns the whole day for the day view', () => {
    expect(getCalendarDateRange(new Date(2026, 6, 30, 15), 'day')).toEqual({
      start: new Date(2026, 6, 30, 0, 0, 0, 0),
      end: new Date(2026, 6, 30, 23, 59, 59, 999),
    })
  })

  it('defaults invalid views to month', () => {
    expect(normalizeCalendarDateView('nope')).toBe('month')
    expect(normalizeCalendarDateView('week')).toBe('week')
  })
})

describe('shiftDate (replaces DateBuilder.add / .subtract)', () => {
  it('adds and subtracts days, keeping the wall-clock time', () => {
    expect(shiftDate(new Date(2026, 0, 31, 9, 15), { days: 1 })).toEqual(
      new Date(2026, 1, 1, 9, 15),
    )
    expect(shiftDate(new Date(2026, 2, 1), { days: -1 })).toEqual(new Date(2026, 1, 28))
  })

  it('shifts months with end-of-month clamping, like luxon', () => {
    expect(shiftDate(new Date(2026, 2, 31), { months: -1 })).toEqual(new Date(2026, 1, 28))
    expect(shiftDate(new Date(2024, 1, 29), { years: 1 })).toEqual(new Date(2025, 1, 28))
  })

  it('applies years and months before days, like luxon', () => {
    expect(shiftDate(new Date(2026, 0, 31), { months: 1, days: 1 })).toEqual(new Date(2026, 2, 1))
  })

  it('does not mutate its input', () => {
    const input = new Date(2026, 0, 1)
    shiftDate(input, { days: 5 })
    expect(input).toEqual(new Date(2026, 0, 1))
  })
})

describe('toLocalISOString (merged from 3 portal copies)', () => {
  it('formats local wall-clock time without a zone suffix', () => {
    expect(toLocalISOString(new Date(2026, 0, 5, 7, 3, 9))).toBe('2026-01-05T07:03:09')
  })
})

describe('toUtcMidnight (portal)', () => {
  it('turns the local calendar day into UTC midnight', () => {
    expect(toUtcMidnight(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05T00:00:00.000Z')
  })
})
