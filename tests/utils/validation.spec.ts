// Pins portal-iq-vue's `validate()` behaviour (src/shared/utils/validate) before the port.
// Each test name says which behaviour it reproduces; quirks are kept on purpose and marked.
import { describe, expect, it } from 'vitest'
import {
  defaultValidationMessages,
  defineSchema,
  isEmpty,
  validate,
  type Schema,
} from '@moonlinetravel/vue-kit/utils'

describe('validate: empty and required', () => {
  it('returns {} for an empty schema and for valid data', () => {
    expect(validate({}, { a: 1 })).toEqual({})
    expect(validate({ name: { required: true } }, { name: 'Ann' })).toEqual({})
  })

  it('skips optional empty fields entirely (undefined, null, "", [])', () => {
    const schema: Schema = {
      a: { minLength: 3 },
      b: { min: 5 },
      c: { isEmail: true },
      d: { array: { minLength: 1 } },
    }
    expect(validate(schema, { a: undefined, b: null, c: '', d: [] })).toEqual({})
  })

  it('reports only "required" for a required empty field, with the label', () => {
    expect(
      validate({ name: { required: true, label: 'Name', minLength: 3 } }, { name: '' }),
    ).toEqual({
      name: ['Name is required.'],
    })
  })

  it('falls back to "Value" when there is no label', () => {
    expect(validate({ x: { required: true } }, {})).toEqual({ x: ['Value is required.'] })
  })

  it('treats an empty array as missing for a required field', () => {
    expect(validate({ tags: { required: true, label: 'Tags' } }, { tags: [] })).toEqual({
      tags: ['Tags is required.'],
    })
  })

  it('accepts 0 and false as present values for required fields', () => {
    expect(validate({ n: { required: true }, b: { required: true } }, { n: 0, b: false })).toEqual(
      {},
    )
  })

  it('flags whitespace-only strings as blank, even when optional (portal quirk)', () => {
    const blank = ['Note cannot be blank or contain only spaces.']
    expect(validate({ note: { label: 'Note' } }, { note: '   ' })).toEqual({ note: blank })
    expect(validate({ note: { label: 'Note', required: true } }, { note: '   ' })).toEqual({
      note: blank,
    })
  })

  it('validates only the given key when `key` is passed (on-blur validation)', () => {
    const schema: Schema = { a: { required: true }, b: { required: true } }
    expect(validate(schema, {}, { key: 'b' })).toEqual({ b: ['Value is required.'] })
  })
})

describe('validate: scalar rules', () => {
  it('stops at a failed type check', () => {
    expect(validate({ age: { type: 'number', min: 18, label: 'Age' } }, { age: '20' })).toEqual({
      age: ['Age must be a number.'],
    })
  })

  it.each([
    ['string', 'x', 1],
    ['number', 1, Number.NaN],
    ['boolean', true, 'true'],
    ['date', new Date(2026, 0, 1), new Date('nope')],
  ] as const)('type %s accepts %o and rejects %o', (type, good, bad) => {
    const schema: Schema = { v: { type } }
    expect(validate(schema, { v: good })).toEqual({})
    expect(validate(schema, { v: bad })).toEqual({ v: [`Value must be a ${type}.`] })
  })

  it('collects string errors in portal order: email, url, pattern, minLength, maxLength', () => {
    const schema: Schema = {
      s: {
        label: 'S',
        isEmail: true,
        isUrl: true,
        pattern: { value: /^\d+$/ },
        minLength: 10,
        maxLength: 1,
      },
    }
    expect(validate(schema, { s: 'ab' })).toEqual({
      s: [
        'S must be a valid email.',
        'S must be a valid URL.',
        'S format is invalid.',
        'S must be at least 10 characters.',
        'S must be at most 1 characters.',
      ],
    })
  })

  it('uses the pattern rule message when given', () => {
    expect(
      validate(
        { code: { pattern: { value: /^A/, message: 'Must start with A.' } } },
        { code: 'B' },
      ),
    ).toEqual({
      code: ['Must start with A.'],
    })
  })

  it.each([
    ['a@b.co', true],
    ['a@b', false],
    ['a b@c.de', false],
  ])('email %s valid=%s (portal regex)', (email, ok) => {
    expect(Object.keys(validate({ e: { isEmail: true } }, { e: email })).length === 0).toBe(ok)
  })

  it.each([
    ['example.com', true],
    ['https://example.com/path?q=1', true],
    ['http://localhost', false],
  ])('url %s valid=%s (portal regex: scheme optional, TLD required)', (url, ok) => {
    expect(Object.keys(validate({ u: { isUrl: true } }, { u: url })).length === 0).toBe(ok)
  })

  it('applies min/max to numbers only and string rules to strings only', () => {
    expect(validate({ n: { min: 5, max: 9, label: 'N' } }, { n: 3 })).toEqual({
      n: ['N must be at least 5.'],
    })
    expect(validate({ n: { min: 5, max: 9, label: 'N' } }, { n: 10 })).toEqual({
      n: ['N must be at most 9.'],
    })
    expect(validate({ n: { min: 5 } }, { n: '3' })).toEqual({})
    expect(validate({ s: { minLength: 5 } }, { s: 3 })).toEqual({})
  })

  it('checks enum membership', () => {
    expect(validate({ c: { enum: ['a', 'b'], label: 'C' } }, { c: 'z' })).toEqual({
      c: ['C must be one of: a, b.'],
    })
  })

  it('checks cross-field matches with strict equality', () => {
    const schema: Schema = {
      confirm: { matches: 'password', matchLabel: 'Password', label: 'Confirm' },
    }
    expect(validate(schema, { password: 'x1', confirm: 'x1' })).toEqual({})
    expect(validate(schema, { password: 'x1', confirm: 'x2' })).toEqual({
      confirm: ['Confirm must match Password.'],
    })
    expect(validate({ c: { matches: 'p' } }, { p: 1, c: '1' })).toEqual({
      c: ['Value must match the expected value.'],
    })
  })

  it('runs custom validators with (value, data) after the built-in rules', () => {
    const schema: Schema = {
      end: {
        label: 'End',
        minLength: 3,
        custom: (value, data) => (value === data.start ? 'End must differ from start.' : undefined),
      },
    }
    expect(validate(schema, { start: 'ab', end: 'ab' })).toEqual({
      end: ['End must be at least 3 characters.', 'End must differ from start.'],
    })
  })
})

describe('validate: arrays', () => {
  it('reports a non-array value under _self', () => {
    expect(validate({ items: { array: {}, label: 'Items' } }, { items: 'x' })).toEqual({
      items: { _self: ['Items must be an array.'] },
    })
  })

  it('reports length errors under _self and skips item validation', () => {
    const schema: Schema = {
      items: { label: 'Items', array: { minLength: 3, schema: { name: { required: true } } } },
    }
    expect(validate(schema, { items: [{}] })).toEqual({
      items: { _self: ['Items must have at least 3 items.'] },
    })
    expect(
      validate({ items: { label: 'Items', array: { maxLength: 1 } } }, { items: [1, 2] }),
    ).toEqual({
      items: { _self: ['Items must have no more than 1 items.'] },
    })
  })

  it('indexes item errors and keeps {} for valid items (portal quirk)', () => {
    const schema: Schema = {
      rows: { array: { schema: { name: { required: true, label: 'Name' } } } },
    }
    expect(validate(schema, { rows: [{ name: 'ok' }, { name: '' }] })).toEqual({
      rows: { 0: {}, 1: { name: ['Name is required.'] } },
    })
  })

  it('returns nothing for a field whose items are all valid', () => {
    const schema: Schema = { rows: { array: { schema: { name: { required: true } } } } }
    expect(validate(schema, { rows: [{ name: 'a' }] })).toEqual({})
  })

  it('validates a null item as an empty object', () => {
    const schema: Schema = { rows: { array: { schema: { name: { required: true } } } } }
    expect(validate(schema, { rows: [null] })).toEqual({
      rows: { 0: { name: ['Value is required.'] } },
    })
  })

  it('resolves `matches` inside an item against that item', () => {
    const schema: Schema = { rows: { array: { schema: { b: { matches: 'a' } } } } }
    expect(validate(schema, { a: 'top', rows: [{ a: 'x', b: 'x' }] })).toEqual({})
  })
})

describe('validate: nested objects', () => {
  it('reports a non-object (array, primitive) under _self', () => {
    const schema: Schema = { addr: { label: 'Address', object: { schema: {} } } }
    expect(validate(schema, { addr: [1] })).toEqual({
      addr: { _self: ['Address must be an object.'] },
    })
    expect(validate(schema, { addr: 'x' })).toEqual({
      addr: { _self: ['Address must be an object.'] },
    })
  })

  it('returns nested errors keyed by property, without _self', () => {
    const schema: Schema = {
      addr: {
        object: { schema: { city: { required: true, label: 'City' }, zip: { minLength: 5 } } },
      },
    }
    expect(validate(schema, { addr: { city: '', zip: '12' } })).toEqual({
      addr: { city: ['City is required.'], zip: ['Value must be at least 5 characters.'] },
    })
    expect(validate(schema, { addr: { city: 'Erbil' } })).toEqual({})
  })
})

describe('validate: messages', () => {
  it('uses overridden messages, including in nested arrays and objects', () => {
    const messages = { required: (field?: string) => `${field ?? 'ئەم خانەیە'} پێویستە.` }
    const schema: Schema = {
      name: { required: true, label: 'ناو' },
      rows: { array: { schema: { x: { required: true } } } },
      addr: { object: { schema: { city: { required: true } } } },
    }
    expect(validate(schema, { rows: [{}], addr: {} }, { messages })).toEqual({
      name: ['ناو پێویستە.'],
      rows: { 0: { x: ['ئەم خانەیە پێویستە.'] } },
      addr: { city: ['ئەم خانەیە پێویستە.'] },
    })
  })

  it('keeps English defaults for messages that are not overridden', () => {
    const messages = { required: () => 'R' }
    expect(validate({ e: { isEmail: true, label: 'E' } }, { e: 'x' }, { messages })).toEqual({
      e: ['E must be a valid email.'],
    })
  })

  it('exports the English defaults', () => {
    expect(defaultValidationMessages.required('Name')).toBe('Name is required.')
  })
})

describe('helpers', () => {
  it('defineSchema returns the schema unchanged', () => {
    const schema = defineSchema<{ name: string }>({ name: { required: true } })
    expect(schema).toEqual({ name: { required: true } })
  })

  it.each([
    [undefined, true],
    [null, true],
    ['', true],
    [[], true],
    [0, false],
    [' ', false],
    [{}, false],
  ])('isEmpty(%o) is %s', (value, expected) => {
    expect(isEmpty(value)).toBe(expected)
  })

  it('ignores an unknown type instead of throwing (portal guards the checker)', () => {
    const schema = { v: { type: 'email', minLength: 3 } } as unknown as Schema
    expect(validate(schema, { v: 'ab' })).toEqual({ v: ['Value must be at least 3 characters.'] })
  })
})
