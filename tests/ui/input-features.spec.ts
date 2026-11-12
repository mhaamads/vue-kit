import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { suite, textField } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

const last = (
  wrapper: { emitted: (e: string) => unknown[][] | undefined },
  event = 'update:modelValue',
) => wrapper.emitted(event)?.at(-1)?.[0]

describe.each(suite(textField))('AppInput features (%s)', (ui, mountInput) => {
  it('masks the shown value and the typed value; the model holds the masked text', async () => {
    const wrapper = mountInput({ props: { mask: '##-##-####' }, model: '12052026' })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('12-05-2026')
    await input.setValue('1205')
    expect(input.element.value).toBe('12-05')
    expect(last(wrapper)).toBe('12-05')
  })

  it.each([
    ['numbers', 'a1b2', '12'],
    ['letters', 'ab12-ç', 'ab'],
    ['alphanumeric', 'a-1 b', 'a1b'],
  ])('acceptOnly="%s" turns %o into %o', async (acceptOnly, typed, kept) => {
    const wrapper = mountInput({ props: { acceptOnly } })
    const input = wrapper.find('input')
    await input.setValue(typed)
    expect(input.element.value).toBe(kept)
    expect(last(wrapper)).toBe(kept)
  })

  it.each([
    ['first', 'hELLO wORLD', 'Hello world'],
    ['each', 'hELLO wORLD', 'Hello World'],
  ])('capitalize="%s" turns %o into %o', async (capitalize, typed, result) => {
    const wrapper = mountInput({ props: { capitalize } })
    await wrapper.find('input').setValue(typed)
    expect(last(wrapper)).toBe(result)
  })

  it('also normalises on focus, so loaded values get the same treatment', async () => {
    const wrapper = mountInput({ props: { capitalize: 'each' }, model: 'john doe' })
    await wrapper.find('input').trigger('focus')
    expect(last(wrapper)).toBe('John Doe')
  })

  it('gives a number for type="number", and null when emptied', async () => {
    const wrapper = mountInput({ props: { type: 'number' } })
    const input = wrapper.find('input')
    await input.setValue('42')
    expect(last(wrapper)).toBe(42)
    await input.setValue('')
    expect(last(wrapper)).toBeNull()
  })

  it('toggles password visibility with an accessible button', async () => {
    const wrapper = mountInput({ props: { type: 'password', id: 'pwd' } })
    const button = wrapper.find('button[aria-controls="pwd"]')
    expect(wrapper.find('input').attributes('type')).toBe('password')
    expect(button.attributes('aria-label')).toBe('Show password')
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(button.attributes('aria-pressed')).toBe('true')
  })

  it('grows a textarea with its content', async () => {
    const wrapper = mountInput({ props: { as: 'textarea' } })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('line 1\nline 2')
    expect(textarea.element.style.height).toMatch(/px$/)
  })

  it('copies the value, or copyValue, and announces it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mountInput({ props: { copyable: true, readonly: true }, model: 'INV-7' })
    const button = wrapper.find('button[aria-label="Copy"]')
    await button.trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('INV-7')
    expect(wrapper.find('button[aria-label="Copied"]').exists()).toBe(true)

    const other = mountInput({ props: { copyable: true, copyValue: 'raw-7' }, model: 'shown' })
    await other.find('button[aria-label="Copy"]').trigger('click')
    expect(writeText).toHaveBeenLastCalledWith('raw-7')
  })

  it('offers a labelled, searchable dial-code picker for type="tel" bound to v-model:code', async () => {
    const onCode = vi.fn()
    const wrapper = mountInput({
      props: { type: 'tel', id: 'phone', code: '+964', 'onUpdate:code': onCode },
    })
    const picker = wrapper.find('#phone-code')
    expect(picker.attributes('role')).toBe('combobox')
    expect(picker.attributes('aria-label')).toBe('Country code')
    expect((picker.element as HTMLInputElement).value).toBe('+964')
    await picker.trigger('click')
    await picker.setValue('turk')
    const options = wrapper.findAll('[role="option"]')
    expect(options.map((o) => o.text())).toContain('TR +90 Turkey')
    await options.find((o) => o.text().startsWith('TR'))!.trigger('click')
    expect(onCode).toHaveBeenLastCalledWith('+90')
  })

  it('keeps a tel input working after the Chrome repaint workaround', async () => {
    const wrapper = mountInput({ props: { type: 'tel', mask: '### ### ####', id: 'tel' } })
    const input = wrapper.find<HTMLInputElement>('input#tel')
    await input.setValue('7501234567')
    await nextTick()
    expect(input.attributes('type')).toBe('tel')
    expect(input.element.value).toBe('750 123 4567')
  })

  it('shows displayValue instead of the model', () => {
    const wrapper = mountInput({ props: { displayValue: 'Erbil (HQ)' }, model: 'branch-1' })
    expect(wrapper.find('input').element.value).toBe('Erbil (HQ)')
  })
})

describe('AppInput country, password, copy', () => {
  it('lists every country in the dial-code picker, searchable by local name too', async () => {
    const { countries } = await import('@mhaamads/vue-kit/ui')
    const wrapper = textField({ props: { type: 'tel', id: 'p' } })
    await wrapper.find('#p-code').trigger('click')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(countries.length)
    expect(countries.find(([iso]) => iso === 'IQ')).toEqual(['IQ', '+964', 'Iraq', 'العراق'])
    await wrapper.find('#p-code').setValue('العراق')
    expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toEqual(['IQ +964 Iraq'])
  })

  it('renders password and copy buttons with visible text from messages, no icons', () => {
    const pwd = textField({ props: { type: 'password' } })
    expect(pwd.find('button').text()).toBe('Show password')
    const copy = textField({ props: { copyable: true }, model: 'x' })
    expect(copy.find('button').text()).toBe('Copy')
    expect(copy.find('svg').exists()).toBe(false)
  })

  it('renders the password toggle only for type="password" and the country select only for tel', () => {
    const plain = textField()
    expect(plain.find('button').exists()).toBe(false)
    expect(plain.find('[data-country]').exists()).toBe(false)
  })
})
