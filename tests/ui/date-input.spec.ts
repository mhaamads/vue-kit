import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { AppDateInput, createVueKit, formatDateValue, toDate } from '@mhaamads/vue-kit/ui'
import { dateField } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

const lastModel = (w: { emitted: (e: string) => unknown[][] | undefined }) =>
  w.emitted('update:modelValue')?.at(-1)?.[0]
const trigger = (w: any) => w.find('button[aria-haspopup="dialog"]')
const picker = (w: any) => w.findComponent(VueDatePicker)

describe('toDate / formatDateValue', () => {
  it('reads YYYY-MM-DD as a local day, not UTC midnight', () => {
    expect(toDate('2026-03-05')).toEqual(new Date(2026, 2, 5))
    expect(toDate('2026-03-05T14:30')).toEqual(new Date(2026, 2, 5, 14, 30))
    expect(toDate('')).toBeNull()
    expect(toDate('nope')).toBeNull()
  })

  it('formats every value shape in the given language', () => {
    expect(formatDateValue(new Date(2026, 10, 12), 'date', 'en-GB')).toBe('12 Nov 2026')
    expect(formatDateValue({ month: 10, year: 2026 }, 'month', 'en')).toBe('November 2026')
    expect(formatDateValue(2026, 'year', 'en')).toBe('2026')
    expect(formatDateValue([new Date(2026, 0, 1), new Date(2026, 0, 7)], 'date', 'en-GB')).toBe(
      '1 Jan 2026 – 7 Jan 2026',
    )
    expect(formatDateValue(null, 'date', 'en')).toBe('')
  })
})

describe('AppDateInput (on @vuepic/vue-datepicker)', () => {
  it('links the label to its trigger and shows the value or the placeholder', async () => {
    const empty = dateField({ props: { label: 'Travel', id: 'travel' } })
    expect(empty.find('label').attributes('for')).toBe('travel')
    expect(trigger(empty).attributes('id')).toBe('travel')
    expect(trigger(empty).text()).toBe('Select date')

    const filled = dateField({ model: new Date(2026, 10, 12) })
    expect(trigger(filled).text()).toContain('2026')
  })

  it('emits the picker’s value through v-model', async () => {
    const wrapper = dateField()
    picker(wrapper).vm.$emit('update:model-value', new Date(2026, 1, 28))
    await nextTick()
    expect(lastModel(wrapper)).toEqual(new Date(2026, 1, 28))
  })

  it('maps its props to the picker: modes, range, limits, disabled days, time off for dates', () => {
    const disabledDates = ['2026-05-01']
    const wrapper = dateField({
      props: {
        mode: 'month',
        range: true,
        minDate: '2026-01-01',
        maxDate: '2026-12-31',
        disabledDates,
      },
    })
    expect(picker(wrapper).props()).toMatchObject({
      monthPicker: true,
      range: true,
      minDate: '2026-01-01',
      maxDate: '2026-12-31',
      disabledDates,
    })
    expect(picker(wrapper).props('timeConfig')).toMatchObject({ enableTimePicker: false })
    expect(picker(dateField({ props: { mode: 'datetime' } })).props('timeConfig')).toMatchObject({
      enableTimePicker: true,
    })
  })

  it('passes any other picker option straight through (e.g. multi-calendars)', () => {
    const wrapper = dateField({ attrs: { multiCalendars: 2 } })
    expect(picker(wrapper).props('multiCalendars')).toBe(2)
  })

  it('clears with a labelled button without opening the calendar', async () => {
    const wrapper = dateField({ model: new Date(2026, 0, 9) })
    const clear = wrapper.find('button[aria-label="Clear date"]')
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    clear.element.dispatchEvent(click)
    await nextTick()
    expect(lastModel(wrapper)).toBeNull()
    expect(dateField({ model: null }).find('button[aria-label="Clear date"]').exists()).toBe(false)
  })

  it('is invalid and described by its hint and error; required is aria-required', () => {
    const wrapper = dateField({
      props: { id: 'd', hint: 'Any weekday', errors: ['Pick a date.'], required: true },
    })
    expect(trigger(wrapper).attributes()).toMatchObject({
      'aria-invalid': 'true',
      'aria-required': 'true',
      'aria-describedby': 'd-hint d-error',
    })
    expect(wrapper.find('#d-error').text()).toContain('Pick a date.')
  })

  it('has leading / trailing slots, a clear slot and ui classes', async () => {
    const wrapper = mount(AppDateInput, {
      props: { modelValue: new Date(2026, 0, 9), ui: { control: 'box', trigger: 't' } },
      slots: {
        leading: () => h('i', '📅'),
        clear: ({ clear }: any) => h('button', { class: 'x', onClick: clear }, '✕'),
      },
    })
    expect(wrapper.find('.box [data-leading] i').text()).toBe('📅')
    expect(trigger(wrapper).classes()).toEqual(['t'])
    await wrapper.find('button.x').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null])
  })

  it('takes texts from the kit’s language', () => {
    const wrapper = dateField({
      model: new Date(2026, 0, 9),
      global: {
        plugins: [
          createVueKit({
            locale: 'ckb',
            syncDocument: false,
            locales: { ckb: { dir: 'rtl', messages: { clearDate: 'سڕینەوە', selectDate: 'ڕۆژ' } } },
          }),
        ],
      },
    })
    expect(wrapper.find('button[aria-label="سڕینەوە"]').exists()).toBe(true)
  })

  it('uses a custom formatValue for the trigger text', () => {
    const wrapper = dateField({
      props: { formatValue: () => '09/01/2026' },
      model: new Date(2026, 0, 9),
    })
    expect(trigger(wrapper).text()).toBe('09/01/2026')
  })
})
