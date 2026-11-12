import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { AppDialog, createVueKit } from '@mhaamads/vue-kit/ui'

afterEach(() => {
  document.body.innerHTML = ''
})

// A page with a trigger button and the dialog bound with v-model, like a consumer writes it.
const page = (
  props: Record<string, unknown> = { title: 'Edit task' },
  messages = {},
  content = () => [h('input', { id: 'first' })],
) => {
  const open = ref(false)
  const App = defineComponent({
    setup: () => () => [
      h('button', { id: 'trigger', onClick: () => (open.value = true) }, 'Open'),
      h(
        AppDialog,
        {
          ...props,
          modelValue: open.value,
          'onUpdate:modelValue': (v: boolean) => (open.value = v),
        },
        content,
      ),
    ],
  })
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createVueKit({ locales: { en: { messages } } })] },
  })
  const dialog = () => wrapper.find('dialog').element as HTMLDialogElement
  const openIt = async () => {
    const trigger = wrapper.find('#trigger').element as HTMLButtonElement
    trigger.focus()
    await wrapper.find('#trigger').trigger('click')
    await nextTick()
    await nextTick()
  }
  return { wrapper, open, dialog, openIt }
}

describe('AppDialog', () => {
  it('opens as a modal dialog from v-model and focuses the first control', async () => {
    const { dialog, openIt } = page()
    expect(dialog().open).toBe(false)
    await openIt()
    expect(dialog().open).toBe(true)
    expect(dialog().contains(document.activeElement)).toBe(true)
  })

  it('is named by its title (aria-labelledby)', async () => {
    const { wrapper, dialog, openIt } = page()
    await openIt()
    expect(dialog().getAttribute('aria-labelledby')).toBe(wrapper.find('h2').attributes('id'))
    expect(wrapper.find('h2').text()).toBe('Edit task')
  })

  it('has no aria-labelledby without a title', async () => {
    const { dialog, openIt } = page({})
    await openIt()
    expect(dialog().hasAttribute('aria-labelledby')).toBe(false)
  })

  it('exposes position as data-position, so one component covers dialogs and drawers', () => {
    expect(page({ position: 'end' }).wrapper.find('dialog').attributes('data-position')).toBe('end')
  })

  it('puts ui classes on root, panel, title and close; renders a footer slot', async () => {
    const { wrapper, openIt } = page(
      { title: 'x', ui: { root: 'r', panel: 'p', title: 't', close: 'c', footer: 'f' } },
      {},
      () => [h('input')],
    )
    await openIt()
    expect(wrapper.find('dialog').classes()).toEqual(['r'])
    expect(wrapper.find('.p .t').text()).toBe('x')
    expect(wrapper.find('button.c').exists()).toBe(true)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const { wrapper, open, dialog, openIt } = page()
    await openIt()
    await wrapper.find('dialog').trigger('cancel')
    await nextTick()
    await nextTick()
    expect(open.value).toBe(false)
    expect(dialog().open).toBe(false)
    expect(document.activeElement?.id).toBe('trigger')
  })

  it('returns focus only after the modal has closed (outside elements are inert while open)', async () => {
    const { wrapper, dialog, openIt } = page()
    await openIt()
    const trigger = wrapper.find('#trigger').element as HTMLButtonElement
    const openWhenFocused: boolean[] = []
    const focus = trigger.focus.bind(trigger)
    trigger.focus = () => {
      openWhenFocused.push(dialog().open)
      focus()
    }
    await wrapper.find('dialog').trigger('cancel')
    await nextTick()
    await nextTick()
    expect(openWhenFocused).toEqual([false])
  })

  it('closes on a backdrop click but not on a click inside the content', async () => {
    const { wrapper, open, openIt } = page()
    await openIt()
    await wrapper.find('#first').trigger('click')
    expect(open.value).toBe(true)
    await wrapper.find('dialog').trigger('click')
    expect(open.value).toBe(false)
  })

  it('can turn Escape and backdrop closing off separately', async () => {
    const { wrapper, open, openIt } = page({ title: 'x', closeOnEscape: false })
    await openIt()
    await wrapper.find('dialog').trigger('cancel')
    expect(open.value).toBe(true)
    await wrapper.find('dialog').trigger('click')
    expect(open.value).toBe(false)

    const second = page({ title: 'x', closeOnBackdrop: false })
    await second.openIt()
    await second.wrapper.find('dialog').trigger('click')
    expect(second.open.value).toBe(true)
  })

  it('closes from the header button, labelled from messages', async () => {
    const { wrapper, open, openIt } = page({ title: 'x' }, { close: 'Back' })
    await openIt()
    const close = wrapper.find('button[data-dialog-close]')
    expect(close.text()).toBe('Back')
    await close.trigger('click')
    expect(open.value).toBe(false)
  })

  it('lets the close button be replaced through the `close` slot', async () => {
    const open = ref(true)
    const wrapper = mount(AppDialog, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': (v: boolean) => (open.value = v),
        title: 'x',
      },
      slots: {
        close: ({ close }: any) => h('button', { 'aria-label': 'Close', onClick: close }, '✕'),
      },
      attachTo: document.body,
    })
    await nextTick()
    await wrapper.find('button[aria-label="Close"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('hides the close button with closeable=false', async () => {
    const { wrapper, openIt } = page({ title: 'x', closeable: false })
    await openIt()
    expect(wrapper.find('button[data-dialog-close]').exists()).toBe(false)
  })

  it('syncs v-model when the browser closes it (e.g. form method="dialog")', async () => {
    const { wrapper, open, dialog, openIt } = page()
    await openIt()
    dialog().close()
    await wrapper.find('dialog').trigger('close')
    expect(open.value).toBe(false)
  })
})
