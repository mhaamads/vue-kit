import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { AppForm, AppInput, createVueKit } from '@mhaamads/vue-kit/ui'
import { defineSchema } from '@mhaamads/vue-kit/utils'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

type Signup = { name: string; email: string }
const schema = defineSchema<Signup>({
  name: { required: true, label: 'Name' },
  email: { required: true, isEmail: true, label: 'Email' },
})

// A consumer form: fields read their errors from Form's slot.
const mountForm = (
  options: { kit?: Parameters<typeof createVueKit>[0]; custom?: boolean } = {},
) => {
  const data = reactive<Signup>({ name: '', email: '' })
  const onSubmit = vi.fn()
  // `custom`: the label is left out.
  const field = (errors: any, key: keyof Signup) =>
    h(AppInput, {
      id: key,
      label: options.custom ? undefined : key,
      modelValue: data[key],
      'onUpdate:modelValue': (v: any) => (data[key] = v),
      errors: errors[key],
    })
  const App = defineComponent({
    setup: () => () =>
      h(
        AppForm,
        { formData: data, schema, onSubmit },
        {
          default: ({ errors }: any) => [
            field(errors, 'name'),
            field(errors, 'email'),
            h('button', { type: 'submit' }, 'Save'),
          ],
        },
      ),
  })
  const kit = createVueKit(options.kit)
  const wrapper = mount(App, { attachTo: document.body, global: { plugins: [kit] } })
  const submit = async () => {
    await wrapper.find('form').trigger('submit')
    await nextTick()
    await new Promise((r) => requestAnimationFrame(r))
  }
  return { wrapper, data, onSubmit, submit, kit }
}

describe('Form', () => {
  it('does not mark empty required fields invalid before the first submit', () => {
    const { wrapper } = mountForm()
    expect(wrapper.find('[aria-invalid="true"]').exists()).toBe(false)
  })

  it('on a failed submit: shows errors on the fields, focuses the first invalid one, no submit event', async () => {
    const { wrapper, onSubmit, submit } = mountForm()
    await submit()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(wrapper.find('#name').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('#name-error').text()).toContain('Name is required.')
    expect(document.activeElement?.id).toBe('name')
  })

  it('focuses the first invalid field even when an earlier one is valid', async () => {
    const { wrapper, data, submit } = mountForm()
    data.name = 'Ann'
    await submit()
    expect(wrapper.find('#name').attributes('aria-invalid')).toBeUndefined()
    expect(document.activeElement?.id).toBe('email')
  })

  it('emits submit and clears errors once the data is valid', async () => {
    const { wrapper, data, onSubmit, submit } = mountForm()
    await submit()
    data.name = 'Ann'
    data.email = 'ann@example.com'
    await submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[aria-invalid="true"]').exists()).toBe(false)
  })

  it('uses the locale validation messages and re-words shown errors on a language switch', async () => {
    const { wrapper, submit, kit } = mountForm({
      kit: {
        locale: 'ckb',
        syncDocument: false,
        locales: {
          ckb: { dir: 'rtl', messages: { required: (field?: string) => `${field} پێویستە.` } },
        },
      },
    })
    await submit()
    expect(wrapper.find('#name-error').text()).toContain('Name پێویستە.')
    kit.setLocale('en')
    await nextTick()
    expect(wrapper.find('#name-error').text()).toContain('Name is required.')
  })

  it('skips validation when devBypassValidation() returns true, with a dev warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { onSubmit, submit } = mountForm({ kit: { devBypassValidation: () => true } })
    await submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('focuses the first invalid control without a label too', async () => {
    const { submit } = mountForm({ custom: true })
    await submit()
    expect(document.activeElement?.id).toBe('name')
  })

  it('exposes validate() and errors for programmatic checks', () => {
    const data = reactive({ name: '' })
    const wrapper = mount(AppForm, {
      props: { formData: data, schema: { name: { required: true } } },
    })
    const vm = wrapper.vm as unknown as { validate: () => boolean; errors: Record<string, unknown> }
    expect(vm.validate()).toBe(false)
    expect(vm.errors).toEqual({ name: ['Value is required.'] })
  })

  it('turns off native browser validation so it never blocks submit handling', () => {
    const { wrapper } = mountForm()
    expect(wrapper.find('form').attributes('novalidate')).toBeDefined()
  })
})
