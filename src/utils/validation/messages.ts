const name = (field?: string) => field ?? 'Value'

/** English validation messages. Override any of them via `validate(..., { messages })`. */
export const defaultValidationMessages = {
  required: (field?: string) => `${name(field)} is required.`,
  accepted: (field?: string) => `${name(field)} must be accepted.`,
  type: (expected: string, field?: string) => `${name(field)} must be a ${expected}.`,
  isEmail: (field?: string) => `${name(field)} must be a valid email.`,
  isUrl: (field?: string) => `${name(field)} must be a valid URL.`,
  pattern: (field?: string, message?: string) => message ?? `${name(field)} format is invalid.`,
  blank: (field?: string) => `${name(field)} cannot be blank or contain only spaces.`,
  min: (min: number, field?: string) => `${name(field)} must be at least ${min}.`,
  max: (max: number, field?: string) => `${name(field)} must be at most ${max}.`,
  minLength: (min: number, field?: string) => `${name(field)} must be at least ${min} characters.`,
  maxLength: (max: number, field?: string) => `${name(field)} must be at most ${max} characters.`,
  enum: (values: readonly (string | number)[], field?: string) =>
    `${name(field)} must be one of: ${values.join(', ')}.`,
  matches: (field?: string, matchLabel?: string) =>
    `${name(field)} must match ${matchLabel ?? 'the expected value'}.`,
  arrayMinLength: (min: number, field?: string) =>
    `${name(field)} must have at least ${min} items.`,
  arrayMaxLength: (max: number, field?: string) =>
    `${name(field)} must have no more than ${max} items.`,
  array: (field?: string) => `${name(field)} must be an array.`,
  object: (field?: string) => `${name(field)} must be an object.`,
}

export type ValidationMessages = typeof defaultValidationMessages
