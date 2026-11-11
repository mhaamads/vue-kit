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
