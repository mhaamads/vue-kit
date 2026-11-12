// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppButton, AppForm, AppInput, createVueKit } from '@mhaamads/vue-kit/ui'
import { defineSchema } from '@mhaamads/vue-kit/utils'

it('mounts the headless AppButton from the installed package with the plugin', () => {
  const wrapper = mount(AppButton, {
    props: { loading: true },
    slots: { default: 'Save' },
    global: { plugins: [createVueKit()] },
  })
  expect(wrapper.attributes('type')).toBe('button')
  expect(wrapper.attributes('aria-busy')).toBe('true')
  expect(wrapper.attributes('class')).toBeUndefined()
})

it('mounts AppInput with label, hint and error wiring, and app-wide ui classes', () => {
  const wrapper = mount(AppInput, {
    props: { id: 'email', label: 'Email', hint: 'Work address', errors: ['Required.'] },
    global: { plugins: [createVueKit({ ui: { input: { input: 'mine' } } })] },
  })
  const input = wrapper.find('input.mine')
  expect(wrapper.find('label').attributes('for')).toBe('email')
  expect(input.attributes('aria-describedby')).toBe('email-hint email-error')
  expect(input.attributes('aria-invalid')).toBe('true')
})

it('mounts the generic AppForm from the installed package and blocks an invalid submit', async () => {
  const formData = { email: '' }
  const schema = defineSchema<typeof formData>({ email: { required: true } })
  const wrapper = mount(AppForm, { props: { formData, schema } })
  await wrapper.find('form').trigger('submit')
  expect(wrapper.emitted('submit')).toBeUndefined()
})
