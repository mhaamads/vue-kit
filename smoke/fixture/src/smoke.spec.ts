import { expect, it } from 'vitest'
import { DATE_TIME_FORMAT, formatDate } from '@moonlinetravel/vue-kit/utils'

it('imports and runs formatDate from the installed package', () => {
  expect(formatDate(new Date(2026, 0, 5, 14, 7), DATE_TIME_FORMAT)).toBe('05 Jan 2026, 02:07 PM')
})
