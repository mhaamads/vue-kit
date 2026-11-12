import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { AppDateInput, createVueKit, toDate } from '@moonlinetravel/vue-kit/ui'
import { contractUis } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

// Minimal custom UI: native inputs bound from the field API, nothing else.
const minimalDate = (f: any) =>
  h('div', [
    f.label ? h('label', f.labelProps, f.label) : null,
    ...(f.range ? [h('input', f.startProps), h('input', f.endProps)] : [h('input', f.inputProps)]),
    f.clearable && f.hasValue ? h('button', f.clearProps, 'x') : null,
    f.error ? h('span', f.errorProps, f.error) : null,
  ])

const lastModel = (w: { emitted: (e: string) => unknown[][] | undefined }) =>
  w.emitted('update:modelValue')?.at(-1)?.[0]

/** What the browser does when the user picks a value: set it, then fire change. */
const pick = async (input: any, value: string) => {
  input.element.value = value
  await input.trigger('change')
}

describe('toDate', () => {
  it('reads YYYY-MM-DD as a local day, not UTC midnight', () => {
    expect(toDate('2026-03-05')).toEqual(new Date(2026, 2, 5))
    expect(toDate('2026-03-05T14:30')).toEqual(new Date(2026, 2, 5, 14, 30))
    expect(toDate('')).toBeNull()
    expect(toDate('nope')).toBeNull()
  })
})

describe.each(contractUis(AppDateInput, 'DateInput', minimalDate))(
  'AppDateInput (%s)',
  (ui, mountInput) => {
    it('date: shows a Date as YYYY-MM-DD and emits a local Date', async () => {
      const wrapper = mountInput({
        props: { label: 'Start', id: 'start' },
        model: new Date(2026, 0, 9),
      })
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('date')
      expect(input.element.value).toBe('2026-01-09')
      expect(wrapper.find('label').attributes('for')).toBe('start')
      await pick(input, '2026-02-28')
      expect(lastModel(wrapper)).toEqual(new Date(2026, 1, 28))
    })

    it('accepts string and number models', () => {
      expect(mountInput({ model: '2026-04-01' }).find('input').element.value).toBe('2026-04-01')
      expect(
        mountInput({ model: new Date(2026, 3, 2).getTime() }).find('input').element.value,
      ).toBe('2026-04-02')
    })

    it('datetime: uses datetime-local and keeps the time', async () => {
      const wrapper = mountInput({ props: { mode: 'datetime' }, model: new Date(2026, 0, 9, 8, 5) })
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('datetime-local')
      expect(input.element.value).toBe('2026-01-09T08:05')
      await pick(input, '2026-01-10T17:45')
      expect(lastModel(wrapper)).toEqual(new Date(2026, 0, 10, 17, 45))
    })

    it('month: emits { month, year } with a 0-based month, like portal', async () => {
      const wrapper = mountInput({ props: { mode: 'month' }, model: { month: 0, year: 2026 } })
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('month')
      expect(input.element.value).toBe('2026-01')
      await pick(input, '2026-12')
      expect(lastModel(wrapper)).toEqual({ month: 11, year: 2026 })
    })

    it('week: emits [monday, sunday] and handles weeks across New Year (ISO 8601)', async () => {
      const wrapper = mountInput({ props: { mode: 'week' }, model: new Date(2026, 0, 1) })
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('week')
      expect(input.element.value).toBe('2026-W01')
      await pick(input, '2026-W01')
      expect(lastModel(wrapper)).toEqual([new Date(2025, 11, 29), new Date(2026, 0, 4)])
      await pick(input, '2026-W53')
      expect(lastModel(wrapper)).toEqual([new Date(2026, 11, 28), new Date(2027, 0, 3)])
      expect(
        mountInput({ props: { mode: 'week' }, model: new Date(2027, 0, 1) }).find('input').element
          .value,
      ).toBe('2026-W53')
    })

    it('maps minDate / maxDate to native min / max', () => {
      const wrapper = mountInput({
        props: { minDate: new Date(2026, 0, 1), maxDate: '2026-12-31' },
      })
      const input = wrapper.find('input')
      expect(input.attributes('min')).toBe('2026-01-01')
      expect(input.attributes('max')).toBe('2026-12-31')
    })

    it('rejects a disabled day: keeps the model, resets the input and reports an error', async () => {
      const wrapper = mountInput({
        props: { id: 'd', disabledDates: ['2026-05-01'] },
        model: new Date(2026, 3, 30),
      })
      const input = wrapper.find('input')
      await pick(input, '2026-05-01')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(input.element.value).toBe('2026-04-30')
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(wrapper.find('#d-error').text()).toContain('This date is not available.')
      await pick(input, '2026-05-02')
      expect(lastModel(wrapper)).toEqual(new Date(2026, 4, 2))
      expect(input.attributes('aria-invalid')).toBeUndefined()
    })

    it('rejects a typed date outside minDate / maxDate (native min/max only limit the picker)', async () => {
      const wrapper = mountInput({ props: { minDate: '2026-01-01', maxDate: '2026-12-31' } })
      const input = wrapper.find('input')
      await pick(input, '2020-06-01')
      await pick(input, '2027-01-01')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(input.attributes('aria-invalid')).toBe('true')
      await pick(input, '2026-06-01')
      expect(lastModel(wrapper)).toEqual(new Date(2026, 5, 1))
    })

    it('range: rejects an end before the start, and a start after the end', async () => {
      const wrapper = mountInput({
        props: { range: true },
        model: [new Date(2026, 0, 10), new Date(2026, 0, 20)],
      })
      const [start, end] = wrapper.findAll('input')
      await pick(end, '2026-01-05')
      await pick(start, '2026-01-25')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(end!.element.value).toBe('2026-01-20')
      expect(start!.element.value).toBe('2026-01-10')
    })

    it('drops the "not available" error when the model is set from outside', async () => {
      const wrapper = mountInput({ props: { disabledDates: ['2026-05-01'] }, model: null })
      await pick(wrapper.find('input'), '2026-05-01')
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
      await wrapper.setProps({ modelValue: new Date(2026, 4, 3) })
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
    })

    it('accepts only allowed days when allowedDates is set', async () => {
      const wrapper = mountInput({ props: { allowedDates: [new Date(2026, 6, 1), '2026-07-15'] } })
      await pick(wrapper.find('input'), '2026-07-02')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      await pick(wrapper.find('input'), '2026-07-15')
      expect(lastModel(wrapper)).toEqual(new Date(2026, 6, 15))
    })

    it('range: two labelled inputs whose min/max follow each other', async () => {
      const wrapper = mountInput({
        props: { range: true, id: 'r' },
        model: [new Date(2026, 0, 5), new Date(2026, 0, 20)],
      })
      const [start, end] = wrapper.findAll('input')
      expect(start!.attributes('aria-label')).toBe('Start date')
      expect(end!.attributes('aria-label')).toBe('End date')
      expect(start!.attributes('max')).toBe('2026-01-20')
      expect(end!.attributes('min')).toBe('2026-01-05')
      expect(end!.attributes('id')).toBe('r-end')
      await pick(end, '2026-01-25')
      expect(lastModel(wrapper)).toEqual([new Date(2026, 0, 5), new Date(2026, 0, 25)])
    })

    it('clears with a labelled button; emptying the input also clears', async () => {
      const wrapper = mountInput({ model: new Date(2026, 0, 9) })
      const clear = wrapper.find('button[aria-label="Clear date"]')
      expect(clear.attributes('type')).toBe('button')
      await clear.trigger('click')
      expect(lastModel(wrapper)).toBeNull()

      const typed = mountInput({ model: new Date(2026, 0, 9) })
      await pick(typed.find('input'), '')
      expect(lastModel(typed)).toBeNull()
    })

    it('passes required, disabled and errors to the control', () => {
      const wrapper = mountInput({
        props: { required: true, disabled: true, errors: ['Pick a date.'] },
      })
      const input = wrapper.find('input')
      expect(input.attributes('aria-required')).toBe('true')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('aria-invalid')).toBe('true')
    })
  },
)

describe('AppDateInput default UI only', () => {
  it('lets the native picker follow dark mode through color-scheme', () => {
    const wrapper = mount(AppDateInput)
    expect(wrapper.find('input').classes()).toEqual(
      expect.arrayContaining(['scheme-light', 'dark:scheme-dark']),
    )
  })

  it('takes texts from messages', async () => {
    const wrapper = mount(AppDateInput, {
      props: { modelValue: new Date(2026, 0, 9), disabledDates: ['2026-01-10'], id: 'x' },
      global: {
        plugins: [
          createVueKit({
            messages: { clearDate: 'سڕینەوە', dateNotAllowed: 'ئەم ڕۆژە بەردەست نییە.' },
          }),
        ],
      },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('سڕینەوە')
    await pick(wrapper.find('input'), '2026-01-10')
    expect(wrapper.find('#x-error').text()).toContain('ئەم ڕۆژە بەردەست نییە.')
  })
})
