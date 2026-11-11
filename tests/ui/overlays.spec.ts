import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import { AppDialog, AppDrawer, AppOverlayHeading, createVueKit } from '@moonlinetravel/vue-kit/ui'

afterEach(() => {
  document.body.innerHTML = ''
})

// A page with a trigger button and the overlay bound with v-model, like a consumer writes it.
const page = (overlay: Component, props: Record<string, unknown> = {}, messages = {}) => {
  const open = ref(false)
  const App = defineComponent({
    setup: () => () => [
      h('button', { id: 'trigger', onClick: () => (open.value = true) }, 'Open'),
      h(
        overlay,
        {
          ...props,
          modelValue: open.value,
          'onUpdate:modelValue': (v: boolean) => (open.value = v),
        },
        {
          default: () => [
            props.title === undefined && overlay === AppDialog
              ? h(AppOverlayHeading, { title: 'Edit task' })
              : null,
            h('input', { id: 'first' }),
          ],
        },
      ),
    ],
  })
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createVueKit({ messages })] },
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

describe.each([
  ['AppDialog', AppDialog, {}],
  ['AppDrawer', AppDrawer, { title: 'Filters' }],
] as const)('%s', (name, overlay, props) => {
  it('opens as a modal dialog from v-model and focuses the first control', async () => {
    const { dialog, openIt } = page(overlay, props)
    expect(dialog().open).toBe(false)
    await openIt()
    expect(dialog().open).toBe(true)
    expect(dialog().contains(document.activeElement)).toBe(true)
  })

  it('is named by its heading (aria-labelledby)', async () => {
    const { wrapper, dialog, openIt } = page(overlay, props)
    await openIt()
    const title = wrapper.find('h2')
    expect(dialog().getAttribute('aria-labelledby')).toBe(title.attributes('id'))
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const { wrapper, open, dialog, openIt } = page(overlay, props)
    await openIt()
    await wrapper.find('dialog').trigger('cancel')
    await nextTick()
    await nextTick()
    expect(open.value).toBe(false)
    expect(dialog().open).toBe(false)
    expect(document.activeElement?.id).toBe('trigger')
  })

  it('returns focus only after the modal has closed (outside elements are inert while open)', async () => {
    const { wrapper, dialog, openIt } = page(overlay, props)
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
    const { wrapper, open, openIt } = page(overlay, props)
    await openIt()
    await wrapper.find('#first').trigger('click')
    expect(open.value).toBe(true)
    await wrapper.find('dialog').trigger('click')
    expect(open.value).toBe(false)
  })

  it('can turn Escape and backdrop closing off separately', async () => {
    const { wrapper, open, openIt } = page(overlay, { ...props, closeOnEscape: false })
    await openIt()
    await wrapper.find('dialog').trigger('cancel')
    expect(open.value).toBe(true)
    await wrapper.find('dialog').trigger('click')
    expect(open.value).toBe(false)

    const second = page(overlay, { ...props, closeOnBackdrop: false })
    await second.openIt()
    await second.wrapper.find('dialog').trigger('click')
    expect(second.open.value).toBe(true)
  })

  it('closes from the heading button, labelled from messages', async () => {
    const { wrapper, open, openIt } = page(overlay, props, { close: 'Back' })
    await openIt()
    await wrapper.find('button[aria-label="Back"]').trigger('click')
    expect(open.value).toBe(false)
  })

  it('syncs v-model when the browser closes it (e.g. form method="dialog")', async () => {
    const { wrapper, open, dialog, openIt } = page(overlay, props)
    await openIt()
    dialog().close()
    await wrapper.find('dialog').trigger('close')
    expect(open.value).toBe(false)
  })
})

describe('AppDrawer', () => {
  it('opens from the end side by default and from the start when asked (logical, mirrors in RTL)', async () => {
    const end = page(AppDrawer, { title: 'x' })
    await end.openIt()
    expect(end.wrapper.find('dialog > div').classes()).toContain('end-0')
    const start = page(AppDrawer, { title: 'x', position: 'start' })
    await start.openIt()
    expect(start.wrapper.find('dialog > div').classes()).toContain('start-0')
  })
})

describe('AppOverlayHeading', () => {
  it('works on its own: emits close, and the back arrow flips in RTL', async () => {
    const wrapper = mount(AppOverlayHeading, { props: { title: 'Details' } })
    const back = wrapper.find('button')
    expect(back.classes()).toContain('rtl:rotate-180')
    expect(back.attributes('aria-label')).toBe('Close')
    await back.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('hides the close button when not closeable', () => {
    const wrapper = mount(AppOverlayHeading, { props: { title: 'x', closeable: false } })
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
