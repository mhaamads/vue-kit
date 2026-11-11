// Ported from portal-iq-vue (src/shared/utils/validate). Behaviour is pinned by
// tests/utils/validation.spec.ts; the only addition is the `messages` option.
import { defaultValidationMessages, type ValidationMessages } from './messages'
import type { FieldRule, FormArrayErrors, FormErrors, FormObjectErrors, Schema } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,6}(:\d+)?(\/\S*)?$/i

const typeChecks: Record<NonNullable<FieldRule['type']>, (v: unknown) => boolean> = {
  string: (v) => typeof v === 'string',
  number: (v) => typeof v === 'number' && !Number.isNaN(v),
  boolean: (v) => typeof v === 'boolean',
  date: (v) => v instanceof Date && !Number.isNaN(v.getTime()),
}

/** `true` for `undefined`, `null`, `''` and `[]`. */
export const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

const isBlank = (value: unknown) => typeof value === 'string' && value !== '' && value.trim() === ''

/** Identity helper that ties schema keys to a data type, for autocomplete and typo checks. */
export function defineSchema<T extends Record<string, unknown> = Record<string, unknown>>(
  schema: Partial<Record<keyof T, FieldRule>>,
): Schema {
  return schema as Schema
}

export type ValidateOptions = {
  /** Validate only this key (on-blur validation). */
  key?: string
  /** Messages to use instead of the English defaults. */
  messages?: Partial<ValidationMessages>
}

/** Validates `data` against `schema`. An empty object means no errors. */
export function validate<T extends Record<string, unknown> = Record<string, unknown>>(
  schema: Schema,
  data: T,
  options: ValidateOptions = {},
): FormErrors<T> {
  const messages = { ...defaultValidationMessages, ...options.messages }
  return run(schema, data, messages, options.key) as FormErrors<T>
}

function run(
  schema: Schema,
  data: Record<string, unknown>,
  m: ValidationMessages,
  key?: string,
): Record<string, unknown> {
  const errors: Record<string, unknown> = {}

  for (const field in schema) {
    if (key && field !== key) continue
    const rules = schema[field]
    if (!rules) continue

    const value = data[field]
    const { label } = rules

    if (isEmpty(value)) {
      if (rules.required) errors[field] = [m.required(label)]
      continue
    }

    if (rules.array) {
      const arrayErrors = validateArray(rules, value, m)
      if (arrayErrors) errors[field] = arrayErrors
      continue
    }

    if (rules.object) {
      const objectErrors = validateObject(rules, value, m)
      if (objectErrors) errors[field] = objectErrors
      continue
    }

    const fieldErrors = validateScalar(rules, value, data, m)
    if (fieldErrors.length > 0) errors[field] = fieldErrors
  }

  return errors
}

function validateArray(
  rules: FieldRule,
  value: unknown,
  m: ValidationMessages,
): FormArrayErrors | undefined {
  const { label } = rules
  if (!Array.isArray(value)) return { _self: [m.array(label)] }

  const { minLength, maxLength, schema } = rules.array ?? {}
  const lengthErrors: string[] = []
  if (typeof minLength === 'number' && value.length < minLength)
    lengthErrors.push(m.arrayMinLength(minLength, label))
  if (typeof maxLength === 'number' && value.length > maxLength)
    lengthErrors.push(m.arrayMaxLength(maxLength, label))
  if (lengthErrors.length > 0) return { _self: lengthErrors }

  if (!schema) return undefined
  const itemErrors = value.map((item) => run(schema, item ?? {}, m))
  if (!itemErrors.some((e) => Object.keys(e).length > 0)) return undefined

  // Valid items stay in the result as {} (same as portal-iq-vue).
  return Object.fromEntries(itemErrors.map((e, i) => [i, e])) as FormArrayErrors
}

function validateObject(
  rules: FieldRule,
  value: unknown,
  m: ValidationMessages,
): FormObjectErrors | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { _self: [m.object(rules.label)] }
  }
  const schema = rules.object?.schema
  if (!schema) return undefined

  const nested = run(schema, value as Record<string, unknown>, m)
  return Object.keys(nested).length > 0 ? (nested as FormObjectErrors) : undefined
}

function validateScalar(
  rules: FieldRule,
  value: unknown,
  data: Record<string, unknown>,
  m: ValidationMessages,
): string[] {
  const { label } = rules
  if (isBlank(value)) return [m.blank(label)]

  // Unknown types (e.g. from a JSON schema) are ignored, as in portal-iq-vue.
  const check = rules.type && typeChecks[rules.type]
  if (check && !check(value)) return [m.type(rules.type!, label)]

  const errors: string[] = []

  if (typeof value === 'string') {
    if (rules.isEmail && !EMAIL_RE.test(value)) errors.push(m.isEmail(label))
    if (rules.isUrl && !URL_RE.test(value)) errors.push(m.isUrl(label))
    if (rules.pattern && !rules.pattern.value.test(value))
      errors.push(m.pattern(label, rules.pattern.message))
    if (typeof rules.minLength === 'number' && value.length < rules.minLength)
      errors.push(m.minLength(rules.minLength, label))
    if (typeof rules.maxLength === 'number' && value.length > rules.maxLength)
      errors.push(m.maxLength(rules.maxLength, label))
  }

  if (typeof value === 'number') {
    if (typeof rules.min === 'number' && value < rules.min) errors.push(m.min(rules.min, label))
    if (typeof rules.max === 'number' && value > rules.max) errors.push(m.max(rules.max, label))
  }

  if (rules.enum && !rules.enum.includes(value as string | number))
    errors.push(m.enum(rules.enum, label))

  if (rules.matches && value !== data[rules.matches])
    errors.push(m.matches(label, rules.matchLabel))

  const customError = rules.custom?.(value, data)
  if (customError) errors.push(customError)

  return errors
}
