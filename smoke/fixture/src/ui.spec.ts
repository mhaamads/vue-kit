// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppButton, createVueKit } from '@moonlinetravel/vue-kit/ui'

it('mounts AppButton from the installed package with the plugin', () => {
  const wrapper = mount(AppButton, {
    props: { text: 'Save', loading: true },
    global: { plugins: [createVueKit({ messages: { loading: 'Saving…' } })] },
  })
  expect(wrapper.attributes('type')).toBe('button')
  expect(wrapper.find('.sr-only').text()).toBe('Saving…')
})

it('mounts AppInput from the installed package with label, hint and error wiring', async () => {
  const { AppInput } = await import('@moonlinetravel/vue-kit/ui')
  const wrapper = mount(AppInput, {
    props: { id: 'email', label: 'Email', hint: 'Work address', errors: ['Required.'] },
  })
  const input = wrapper.find('input')
  expect(wrapper.find('label').attributes('for')).toBe('email')
  expect(input.attributes('aria-describedby')).toBe('email-hint email-error')
  expect(input.attributes('aria-invalid')).toBe('true')
})

it('mounts the generic AppForm from the installed package and blocks an invalid submit', async () => {
  const { AppForm } = await import('@moonlinetravel/vue-kit/ui')
  const { defineSchema } = await import('@moonlinetravel/vue-kit/utils')
  const formData = { email: '' }
  const schema = defineSchema<typeof formData>({ email: { required: true } })
  const wrapper = mount(AppForm, { props: { formData, schema } })
  await wrapper.find('form').trigger('submit')
  expect(wrapper.emitted('submit')).toBeUndefined()
})
