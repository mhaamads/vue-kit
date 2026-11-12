// The opt-in options: text clearable / counter / debounce / loading / rules, select maxValues,
// the PIN input, and AppForm's validate-on="blur", resetValidation() and warn-unsaved.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { AppForm, AppInput, AppPinInput } from '@mhaamads/vue-kit/ui'
import { defineSchema } from '@mhaamads/vue-kit/utils'
import { select, textField } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

const lastModel = (w: { emitted: (e: string) => unknown[][] | undefined }) =>
  w.emitted('update:modelValue')?.at(-1)?.[0]

describe('AppInput options', () => {
  it('clearable: a Clear button while there is a value; it sets the model to null', async () => {
    const wrapper = textField({ props: { clearable: true }, model: 'hello' })
    await wrapper.find('button[aria-label="Clear"]').trigger('click')
    expect(lastModel(wrapper)).toBeNull()
    expect(wrapper.find('button[aria-label="Clear"]').exists()).toBe(false)
    expect(
      textField({ props: { clearable: true, disabled: true }, model: 'x' })
        .find('button')
        .exists(),
    ).toBe(false)
    expect(textField({ model: 'x' }).find('button').exists()).toBe(false)
  })

  it('clearable: the clear slot gets the function', async () => {
    const wrapper = mount(AppInput, {
      props: { clearable: true, modelValue: 'x' },
      slots: { clear: ({ clear }: any) => h('button', { class: 'x', onClick: clear }, '✕') },
    })
    await wrapper.find('button.x').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([null])
  })

  it('counter: characters typed, with the maxlength when set', async () => {
    expect(
      textField({ props: { counter: true }, model: 'abc' })
        .find('[data-counter]')
        .text(),
    ).toBe('3')
    const limited = textField({
      props: { counter: true },
      attrs: { maxlength: '10' },
      model: 'abcd',
    })
    expect(limited.find('[data-counter]').text()).toBe('4 / 10')
    expect(textField({ model: 'abc' }).find('[data-counter]').exists()).toBe(false)
  })

  it('debounce: shows what is typed at once, updates the model after the pause', async () => {
    vi.useFakeTimers()
    const wrapper = textField({ props: { debounce: 300 } })
    const input = wrapper.find('input')
    await input.setValue('vis')
    await input.setValue('visa')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(input.element.value).toBe('visa')
    vi.advanceTimersByTime(300)
    expect(wrapper.emitted('update:modelValue')).toEqual([['visa']])
  })

  it('debounce: leaving the field updates the model right away', async () => {
    vi.useFakeTimers()
    const wrapper = textField({ props: { debounce: 1000 } })
    await wrapper.find('input').setValue('abc')
    await wrapper.find('input').trigger('blur')
    expect(lastModel(wrapper)).toBe('abc')
  })

  it('loading: a status message and aria-busy on the input', () => {
    const wrapper = textField({ props: { loading: true } })
    expect(wrapper.find('[role="status"]').text()).toBe('Loading')
    expect(wrapper.find('input').attributes('aria-busy')).toBe('true')
    expect(textField().find('[role="status"]').exists()).toBe(false)
  })

  it('rules: checks on its own only when given, first on leaving, then while typing', async () => {
    const wrapper = textField({
      props: { id: 'e', label: 'Email', rules: { required: true, isEmail: true } },
    })
    const input = wrapper.find('input')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    await input.trigger('blur')
    expect(wrapper.find('#e-error').text()).toBe('Email is required.')
    await input.setValue('ann')
    await wrapper.setProps({ modelValue: 'ann' })
    expect(wrapper.find('#e-error').text()).toBe('Email must be a valid email.')
    await wrapper.setProps({ modelValue: 'ann@example.com' })
    expect(input.attributes('aria-invalid')).toBeUndefined()

    const none = textField({ props: { id: 'n' } })
    await none.find('input').trigger('blur')
    expect(none.find('#n-error').exists()).toBe(false)
  })

  it('rules: validate() is exposed and its errors join the ones passed in', async () => {
    const wrapper = mount(AppInput, {
      props: { id: 'x', rules: { required: true, label: 'Name' }, errors: ['Taken.'] },
    })
    expect(wrapper.vm.validate()).toBe(false)
    await nextTick()
    expect(wrapper.findAll('#x-error p').map((p) => p.text())).toEqual([
      'Taken.',
      'Name is required.',
    ])
  })
})

describe('AppSelect maxValues', () => {
  const options = [
    { label: 'A', value: 1 },
    { label: 'B', value: 2 },
    { label: 'C', value: 3 },
  ]

  it('stops new picks at the limit; picked ones stay removable', async () => {
    const wrapper = select({ props: { options, multiple: true, maxValues: 2 }, model: [1, 2] })
    await wrapper.find('[role="combobox"]').trigger('click')
    const [a, , c] = wrapper.findAll('[role="option"]')
    expect(c!.attributes('aria-disabled')).toBe('true')
    expect(c!.attributes('data-disabled')).toBe('')
    await c!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(a!.attributes('aria-disabled')).toBeUndefined()
    await a!.trigger('click')
    expect(lastModel(wrapper)).toEqual([2])
  })
})

describe('AppPinInput', () => {
  const pin = (props: Record<string, unknown> = {}) => {
    const wrapper = mount(AppPinInput, {
      props: {
        ...props,
        'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as string }),
      },
      attachTo: document.body,
    })
    return wrapper
  }

  it('shows `length` boxes over one real input made for one-time codes', () => {
    const wrapper = pin({ length: 4, id: 'otp', label: 'Code' })
    expect(wrapper.findAll('[data-cell]')).toHaveLength(4)
    const input = wrapper.find('input')
    expect(input.attributes()).toMatchObject({
      id: 'otp',
      autocomplete: 'one-time-code',
      inputmode: 'numeric',
    })
    // No maxlength: it would cut pasted text like "Your code: 123-456" before it's cleaned.
    expect(input.attributes('maxlength')).toBeUndefined()
    expect(wrapper.find('label').attributes('for')).toBe('otp')
    expect(pin().findAll('[data-cell]')).toHaveLength(6)
  })

  it('fills the boxes and emits complete once, with the code', async () => {
    const wrapper = pin({ length: 4 })
    await wrapper.find('input').setValue('12')
    expect(wrapper.findAll('[data-cell]').map((c) => c.text())).toEqual(['1', '2', '', ''])
    expect(wrapper.emitted('complete')).toBeUndefined()
    await wrapper.find('input').setValue('1234')
    expect(wrapper.emitted('complete')).toEqual([['1234']])
    expect(wrapper.attributes('data-complete')).toBe('')
  })

  it('cleans pasted or auto-filled text: separators, letters, extra digits', async () => {
    const wrapper = pin({ length: 6 })
    await wrapper.find('input').setValue('Your code: 123-45 6789')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['123456'])
    expect(wrapper.find('input').element.value).toBe('123456')
  })

  it('turns Arabic-Indic and Persian digits into 0-9', async () => {
    const wrapper = pin({ length: 4 })
    await wrapper.find('input').setValue('١٢۳۴')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['1234'])
  })

  it('stays left-to-right, marks the active box while focused, and passes errors', async () => {
    const wrapper = pin({ length: 4, id: 'p', errors: ['Wrong code.'], modelValue: '12' })
    expect(wrapper.find('[dir="ltr"]').exists()).toBe(true)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.findAll('[data-cell]')[2]!.attributes('data-active')).toBe('')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('#p-error').text()).toBe('Wrong code.')
  })
})

describe('AppForm options', () => {
  type Data = { name: string; email: string }
  const schema = defineSchema<Data>({
    name: { required: true, label: 'Name' },
    email: { required: true, isEmail: true, label: 'Email' },
  })
  const mountForm = (formProps: Record<string, unknown> = {}) => {
    const data = reactive<Data>({ name: '', email: '' })
    const form = ref<any>()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            AppForm,
            { ref: form, formData: data, schema, ...formProps },
            {
              default: ({ errors }: any) =>
                (['name', 'email'] as const).map((key) =>
                  h(AppInput, {
                    id: key,
                    modelValue: data[key],
                    'onUpdate:modelValue': (v: any) => (data[key] = v),
                    errors: errors[key],
                  }),
                ),
            },
          ),
      }),
      { attachTo: document.body },
    )
    return { wrapper, data, form }
  }

  it('validate-on="blur": errors appear for changed fields as the user leaves them, then follow typing', async () => {
    const { wrapper, data } = mountForm({ validateOn: 'blur' })
    await wrapper.find('#name').trigger('focusout')
    expect(wrapper.find('#name-error').exists()).toBe(false) // untouched: no error yet
    data.email = 'ann'
    await nextTick()
    await wrapper.find('#email').trigger('focusout')
    expect(wrapper.find('#email-error').text()).toContain('Email must be a valid email.')
    expect(wrapper.find('#name-error').exists()).toBe(false)
    data.email = 'ann@example.com'
    await nextTick()
    expect(wrapper.find('#email-error').exists()).toBe(false)
  })

  it('submit mode (default) shows nothing until submit', async () => {
    const { wrapper, data } = mountForm()
    data.email = 'ann'
    await nextTick()
    await wrapper.find('#email').trigger('focusout')
    expect(wrapper.find('#email-error').exists()).toBe(false)
  })

  it('resetValidation() clears errors and makes the current data the starting point', async () => {
    const { wrapper, data, form } = mountForm()
    form.value.validate()
    await nextTick()
    expect(wrapper.find('#name-error').exists()).toBe(true)
    data.name = 'Loaded record'
    expect(form.value.dirty).toBe(true)
    form.value.resetValidation()
    await nextTick()
    expect(wrapper.find('#name-error').exists()).toBe(false)
    expect(form.value.dirty).toBe(false)
  })

  it('warn-unsaved: asks before leaving only with the option on and unsaved changes', async () => {
    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(event)
      return event.defaultPrevented
    }
    const off = mountForm()
    off.data.name = 'x'
    expect(leave()).toBe(false)
    off.wrapper.unmount()

    const on = mountForm({ warnUnsaved: true })
    expect(leave()).toBe(false)
    on.data.name = 'x'
    expect(leave()).toBe(true)
    on.form.value.resetValidation()
    expect(leave()).toBe(false)
  })
})
