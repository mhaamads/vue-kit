// Content slots: change what's inside a piece without writing your own HTML.
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AppCheckbox,
  AppDialog,
  AppInput,
  AppRadioGroup,
  AppSelect,
  AppToasts,
  dismissToast,
  feedbackState,
  useToast,
} from '@mhaamads/vue-kit/ui'

afterEach(() => {
  feedbackState.toasts.forEach((t) => dismissToast(t.id))
  document.body.innerHTML = ''
})

describe('content slots', () => {
  it('label, hint and errors: your content in the kit’s linked elements', () => {
    const wrapper = mount(AppInput, {
      props: { id: 'e', label: 'Email', errors: ['Required.', 'Too short.'] },
      slots: {
        label: ({ label }: any) => [label, h('em', ' (work)')],
        hint: () => h('a', { href: '/help' }, 'Which email?'),
        errors: ({ error }: any) => `⚠ ${error}`,
      },
    })
    expect(wrapper.find('label').text()).toBe('Email (work)')
    expect(wrapper.find('label').attributes('for')).toBe('e')
    expect(wrapper.find('#e-hint a').text()).toBe('Which email?')
    expect(wrapper.find('#e-error').text()).toBe('⚠ Required.')
    // A hint given only through the slot still describes the input.
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('e-hint e-error')
  })

  it('checkbox description and radio items', () => {
    const box = mount(AppCheckbox, {
      props: { id: 't', label: 'Terms' },
      slots: { description: () => h('a', { href: '/terms' }, 'Read the terms') },
    })
    expect(box.find('#t-description a').text()).toBe('Read the terms')
    expect(box.find('input').attributes('aria-describedby')).toBe('t-description')

    const group = mount(AppRadioGroup, {
      props: { options: [{ label: 'Lead', value: 1 }], modelValue: 1 },
      slots: {
        item: ({ option, checked }: any) => h('b', `${option.label}${checked ? ' ✓' : ''}`),
      },
    })
    expect(group.find('label b').text()).toBe('Lead ✓')
    expect(group.find('label input[type="radio"]').exists()).toBe(true)
  })

  it('select chips and the empty message', async () => {
    const wrapper = mount(AppSelect, {
      props: {
        options: [{ label: 'Erbil', value: 1 }],
        multiple: true,
        modelValue: [1],
        query: 'zz',
      },
      slots: {
        chip: ({ option }: any) => h('i', `#${option.label}`),
        empty: ({ query }: any) => h('em', `Nothing for "${query}"`),
      },
      attachTo: document.body,
    })
    expect(wrapper.find('[data-chip] i').text()).toBe('#Erbil')
    expect(wrapper.find('[data-chip] button[aria-label="Remove Erbil"]').exists()).toBe(true)
    await wrapper.find('[role="combobox"]').trigger('click')
    expect(wrapper.find('[role="status"] em').text()).toBe('Nothing for "zz"')
  })

  it('dialog title names the dialog; toast message is yours', async () => {
    const dialog = mount(AppDialog, {
      props: { modelValue: true },
      slots: { title: () => ['Edit ', h('b', 'Task 7')] },
      attachTo: document.body,
    })
    await nextTick()
    const title = dialog.find('h2')
    expect(title.text()).toBe('Edit Task 7')
    expect(dialog.find('dialog').attributes('aria-labelledby')).toBe(title.attributes('id'))

    const toasts = mount(AppToasts, {
      slots: { message: ({ toast }: any) => h('strong', toast.message) },
      attachTo: document.body,
    })
    useToast({ type: 'success', message: 'Saved', persistent: true })
    await nextTick()
    // The dialog is still open, so the toast is shown inside it (above its backdrop).
    expect(dialog.find('dialog [data-toast] strong').text()).toBe('Saved')
    expect(toasts.exists()).toBe(true)
  })
})
