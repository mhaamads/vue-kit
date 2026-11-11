import { expect, it } from 'vitest'
import {
  DATE_TIME_FORMAT,
  defineSchema,
  formatDate,
  validate,
  type FormErrors,
} from '@moonlinetravel/vue-kit/utils'

it('imports and runs formatDate from the installed package', () => {
  expect(formatDate(new Date(2026, 0, 5, 14, 7), DATE_TIME_FORMAT)).toBe('05 Jan 2026, 02:07 PM')
})

it('validates a schema through the installed package', () => {
  type Signup = { email: string; tags: string[] }
  const schema = defineSchema<Signup>({
    email: { required: true, isEmail: true, label: 'Email' },
    tags: { array: { minLength: 1 }, label: 'Tags' },
  })
  const errors: FormErrors<Signup> = validate(schema, { email: 'nope', tags: ['a'] })
  expect(errors).toEqual({ email: ['Email must be a valid email.'] })
})

it('runs the vue-based event bus against the app’s own vue (peer dependency)', async () => {
  const { broadcastEvent, useGlobalEvent } = await import('@moonlinetravel/vue-kit/utils')
  const seen: unknown[] = []
  const off = useGlobalEvent('saved', (p) => seen.push(p))
  broadcastEvent('saved', { id: 1 })
  off()
  expect(seen).toEqual([{ id: 1 }])
})
