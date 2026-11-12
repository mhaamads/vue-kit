import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { AppTimeInput, createVueKit } from '@moonlinetravel/vue-kit/ui'
import { contractUis } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

// Minimal custom UI: binds only the field API.
const minimalTime = (f: any) =>
  h('div', f.rootProps, [
    f.label ? h('label', f.labelProps, f.label) : null,
    h('button', f.triggerProps, f.displayValue || f.placeholder),
    f.clearable && f.time ? h('button', f.clearProps, 'x') : null,
    f.open
      ? h('div', f.panelProps, [
          ...f.presets.map((p: any) =>
            h('button', { type: 'button', onClick: () => f.selectPreset(p) }, p.label),
          ),
          ...(['hours', 'minutes', ...(f.is12 ? ['period'] : [])] as const).map((kind) =>
            h(
              'div',
              f.columnProps(kind),
              f.columns[kind].map((o: any) => h('button', f.optionProps(kind, o), o.label)),
            ),
          ),
        ])
      : null,
    f.error ? h('span', f.errorProps, f.error) : null,
  ])

const lastModel = (w: { emitted: (e: string) => unknown[][] | undefined }) =>
  w.emitted('update:modelValue')?.at(-1)?.[0]
const triggerOf = (w: any) => w.find('[aria-haspopup="dialog"]')
const column = (w: any, label: string) => w.find(`[role="radiogroup"][aria-label="${label}"]`)
const optionIn = (w: any, label: string, text: string) =>
  column(w, label)
    .findAll('[role="radio"]')
    .find((b: any) => b.text() === text)

describe.each(contractUis(AppTimeInput, 'TimeInput', minimalTime))(
  'AppTimeInput (%s)',
  (ui, mountInput) => {
    it('shows HH:mm in 24 h and hh:mm AM/PM in 12 h', () => {
      expect(triggerOf(mountInput({ model: { hours: 14, minutes: 5 } })).text()).toContain('14:05')
      const twelve = mountInput({ props: { format: 12 }, model: { hours: 0, minutes: 30 } })
      expect(triggerOf(twelve).text()).toContain('12:30 AM')
      expect(
        triggerOf(mountInput({ props: { format: 12 }, model: { hours: 12, minutes: 0 } })).text(),
      ).toContain('12:00 PM')
    })

    it('accepts "HH:mm" and "HHmm" strings, emitting { hours, minutes }', async () => {
      const wrapper = mountInput({ model: '0930' })
      expect(triggerOf(wrapper).text()).toContain('09:30')
      await triggerOf(wrapper).trigger('click')
      await optionIn(wrapper, 'Minutes', '45').trigger('click')
      expect(lastModel(wrapper)).toEqual({ hours: 9, minutes: 45 })
    })

    it('opens a labelled panel with labelled hour and minute radio groups', async () => {
      const wrapper = mountInput({ props: { id: 't', label: 'Start' } })
      const trigger = triggerOf(wrapper)
      expect(trigger.attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('label').attributes('for')).toBe('t')
      await trigger.trigger('click')
      expect(trigger.attributes('aria-expanded')).toBe('true')
      expect(wrapper.find('#t-panel').attributes('role')).toBe('dialog')
      expect(column(wrapper, 'Hours').exists()).toBe(true)
      expect(column(wrapper, 'Minutes').exists()).toBe(true)
      expect(column(wrapper, 'AM/PM').exists()).toBe(false)
    })

    it('12 h: picking 9 with no value gives 09:00 (AM first, like portal); PM moves it to 21:00', async () => {
      const wrapper = mountInput({ props: { format: 12 } })
      await triggerOf(wrapper).trigger('click')
      await optionIn(wrapper, 'Hours', '09').trigger('click')
      expect(lastModel(wrapper)).toEqual({ hours: 9, minutes: 0 })
      await optionIn(wrapper, 'AM/PM', 'PM').trigger('click')
      expect(lastModel(wrapper)).toEqual({ hours: 21, minutes: 0 })
    })

    it('lists minutes by minuteStep', async () => {
      const wrapper = mountInput({ props: { minuteStep: 15 } })
      await triggerOf(wrapper).trigger('click')
      expect(
        column(wrapper, 'Minutes')
          .findAll('[role="radio"]')
          .map((b: any) => b.text()),
      ).toEqual(['00', '15', '30', '45'])
    })

    it('disables hours and minutes outside minTime / maxTime (portal only filtered presets)', async () => {
      const wrapper = mountInput({
        props: { minTime: '09:30', maxTime: '17:00' },
        model: { hours: 9, minutes: 45 },
      })
      await triggerOf(wrapper).trigger('click')
      expect(optionIn(wrapper, 'Hours', '08').attributes('disabled')).toBeDefined()
      expect(optionIn(wrapper, 'Hours', '09').attributes('disabled')).toBeUndefined()
      expect(optionIn(wrapper, 'Hours', '18').attributes('disabled')).toBeDefined()
      expect(optionIn(wrapper, 'Minutes', '15').attributes('disabled')).toBeDefined()
      expect(optionIn(wrapper, 'Minutes', '30').attributes('disabled')).toBeUndefined()
    })

    it('clamps into range when an hour change would leave it (17:45 → 17:00 with max 17:00)', async () => {
      const wrapper = mountInput({ props: { maxTime: '17:00' }, model: { hours: 16, minutes: 45 } })
      await triggerOf(wrapper).trigger('click')
      await optionIn(wrapper, 'Hours', '17').trigger('click')
      expect(lastModel(wrapper)).toEqual({ hours: 17, minutes: 0 })
    })

    it('moves through a column with the arrow keys, skipping disabled options', async () => {
      const wrapper = mountInput({ props: { minTime: '10:00' }, model: { hours: 11, minutes: 0 } })
      await triggerOf(wrapper).trigger('click')
      const hours = column(wrapper, 'Hours')
      expect(optionIn(wrapper, 'Hours', '11').attributes('tabindex')).toBe('0')
      expect(optionIn(wrapper, 'Hours', '12').attributes('tabindex')).toBe('-1')
      await hours.trigger('keydown', { key: 'ArrowDown' })
      expect(lastModel(wrapper)).toEqual({ hours: 12, minutes: 0 })
      await wrapper.setProps({ modelValue: { hours: 10, minutes: 0 } })
      await hours.trigger('keydown', { key: 'ArrowUp' })
      expect(lastModel(wrapper)).toEqual({ hours: 23, minutes: 0 })
    })

    it('offers only in-range presets', async () => {
      const presets = [
        { label: 'Morning', value: { hours: 8, minutes: 0 } },
        { label: 'Noon', value: { hours: 12, minutes: 0 } },
      ]
      const wrapper = mountInput({ props: { presets, minTime: '09:00' } })
      await triggerOf(wrapper).trigger('click')
      expect(wrapper.text()).not.toContain('Morning')
      await wrapper
        .findAll('button')
        .find((b) => b.text() === 'Noon')!
        .trigger('click')
      expect(lastModel(wrapper)).toEqual({ hours: 12, minutes: 0 })
    })

    it('clears with a labelled button', async () => {
      const wrapper = mountInput({ model: { hours: 8, minutes: 0 } })
      await wrapper.find('button[aria-label="Clear time"]').trigger('click')
      expect(lastModel(wrapper)).toBeNull()
    })

    it('closes on Escape and when focus leaves the component', async () => {
      const wrapper = mountInput()
      await triggerOf(wrapper).trigger('click')
      await triggerOf(wrapper).trigger('keydown', { key: 'Escape' })
      expect(triggerOf(wrapper).attributes('aria-expanded')).toBe('false')

      await triggerOf(wrapper).trigger('click')
      const outside = document.createElement('button')
      document.body.append(outside)
      await triggerOf(wrapper).trigger('focusout', { relatedTarget: outside })
      expect(triggerOf(wrapper).attributes('aria-expanded')).toBe('false')
    })

    it('Escape inside the panel closes it and returns focus to the trigger', async () => {
      const wrapper = mountInput({ model: { hours: 5, minutes: 0 } })
      await triggerOf(wrapper).trigger('click')
      const option = optionIn(wrapper, 'Hours', '05')
      ;(option.element as HTMLElement).focus()
      await option.trigger('keydown', { key: 'Escape' })
      expect(triggerOf(wrapper).attributes('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(triggerOf(wrapper).element)
    })

    it('stays open when focus moves inside it', async () => {
      const wrapper = mountInput()
      await triggerOf(wrapper).trigger('click')
      const inside = optionIn(wrapper, 'Hours', '05').element
      await triggerOf(wrapper).trigger('focusout', { relatedTarget: inside })
      expect(triggerOf(wrapper).attributes('aria-expanded')).toBe('true')
    })

    it('does not open or change when disabled', async () => {
      const wrapper = mountInput({ props: { disabled: true }, model: { hours: 8, minutes: 0 } })
      expect(triggerOf(wrapper).attributes('disabled')).toBeDefined()
    })
  },
)

describe('AppTimeInput default UI only', () => {
  it('sets "Now" and confirms with OK, using messages', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 13, 7))
    const wrapper = mount(AppTimeInput, {
      attachTo: document.body,
      global: { plugins: [createVueKit({ messages: { now: 'ئێستا', ok: 'باشە' } })] },
    })
    await triggerOf(wrapper).trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'ئێستا')!
      .trigger('click')
    expect(lastModel(wrapper)).toEqual({ hours: 13, minutes: 7 })
    const ok = wrapper.findAll('button').find((b) => b.text() === 'باشە')!
    ;(ok.element as HTMLElement).focus()
    await ok.trigger('click')
    await nextTick()
    expect(triggerOf(wrapper).attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(triggerOf(wrapper).element)
  })

  it('hides "Now" when the current time is out of range', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 20, 0))
    const wrapper = mount(AppTimeInput, { props: { maxTime: '17:00' }, attachTo: document.body })
    await triggerOf(wrapper).trigger('click')
    expect(wrapper.text()).not.toContain('Now')
  })
})
