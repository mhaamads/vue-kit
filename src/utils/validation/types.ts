/** Rule definition for a single field in a validation schema */
export type FieldRule = {
  /** Whether the field is required (`false` and `0` count as answers; see `accepted`) */
  required?: boolean
  /** The value must be `true`, e.g. an "I accept the terms" checkbox */
  accepted?: boolean
  /** Human-readable label used in error messages */
  label?: string
  /** Expected primitive type */
  type?: 'string' | 'number' | 'date' | 'boolean'

  // String rules
  isEmail?: boolean
  isUrl?: boolean
  /** Regex pattern with optional custom message */
  pattern?: { value: RegExp; message?: string }
  /** Minimum character length (strings) */
  minLength?: number
  /** Maximum character length (strings) */
  maxLength?: number

  // Number rules
  min?: number
  max?: number

  enum?: readonly (string | number)[]

  /** Key of the sibling field whose value must match */
  matches?: string
  /** Label of the matched field (for the error message) */
  matchLabel?: string

  /**
   * Return an error string if invalid, or `undefined` if valid.
   * Receives the field value and the object that holds the field.
   */
  custom?: (value: unknown, data: Record<string, unknown>) => string | undefined

  array?: {
    schema?: Schema
    minLength?: number
    maxLength?: number
  }

  /** Schema for a nested plain object field */
  object?: {
    schema: Schema
  }
}

/** A validation schema: field names mapped to their rules */
export type Schema = Record<string, FieldRule>

/**
 * Errors for an array field.
 * `_self`: array-level errors (e.g. "at least 1 item"). `[index]`: per-item errors.
 */
export type FormArrayErrors<U = Record<string, unknown>> = {
  [index: number]: FormErrors<U>
  _self?: string[]
}

/**
 * Recursive error map mirroring the data shape.
 * Scalars → `string[]`, arrays → `FormArrayErrors`, objects → `FormObjectErrors`.
 */
export type FormErrors<T = Record<string, unknown>> = {
  [K in keyof T]?: NonNullable<T[K]> extends (infer U)[]
    ? FormArrayErrors<U>
    : NonNullable<T[K]> extends Record<string, unknown>
      ? FormObjectErrors<NonNullable<T[K]>>
      : string[]
}

/**
 * Errors for a nested object field.
 * `_self`: object-level errors (e.g. "must be an object"). `[key]`: per-property errors.
 */
export type FormObjectErrors<T = Record<string, unknown>> = FormErrors<T> & {
  _self?: string[]
}
