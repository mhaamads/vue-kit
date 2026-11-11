import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AppButton,
  AppIcon,
  AppText,
  createVueKit,
  useVueKit,
  ZIndex,
} from '@moonlinetravel/vue-kit/ui'
import { defaultValidationMessages } from '@moonlinetravel/vue-kit/utils'

const withKit = (options = {}) => ({ global: { plugins: [createVueKit(options)] } })

// Iconsax icons are async components: wait until the <svg> is in the DOM.
const iconsLoaded = (wrapper: { find: (s: string) => { exists: () => boolean } }) =>
  vi.waitFor(() => expect(wrapper.find('svg').exists()).toBe(true))

describe('createVueKit / useVueKit', () => {
  const Probe = defineComponent({
    setup() {
      const config = useVueKit()
      return () => h('pre', JSON.stringify({ dir: config.dir, loading: config.messages.loading }))
    },
  })

  it('works without the plugin, with English LTR defaults', () => {
    expect(mount(Probe).text()).toBe('{"dir":"ltr","loading":"Loading"}')
  })

  it('merges options over the defaults, including validation messages', () => {
    let config!: ReturnType<typeof useVueKit>
    const Grab = defineComponent({
      setup() {
        config = useVueKit()
        return () => null
      },
    })
    mount(Grab, withKit({ dir: 'rtl', messages: { loading: 'بارکردن' } }))
    expect(config.dir).toBe('rtl')
    expect(config.messages.loading).toBe('بارکردن')
    expect(config.messages.required('Name')).toBe(defaultValidationMessages.required('Name'))
    expect(config.devBypassValidation()).toBe(false)
    expect(config.components).toEqual({})
  })
})

describe('AppText', () => {
  it('renders the tag with size, weight and colour classes', () => {
    const wrapper = mount(AppText, {
      props: { tag: 'h2', size: '24', weight: 'bold', color: 'error' },
      slots: { default: 'Hello' },
    })
    expect(wrapper.element.tagName).toBe('H2')
    expect(wrapper.text()).toBe('Hello')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['lg:text-2xl', 'text-xl', 'font-bold', 'text-app-error']),
    )
  })

  it('lets the caller class win over a default of the same kind', () => {
    const wrapper = mount(AppText, { attrs: { class: 'font-light', id: 't' } })
    expect(wrapper.classes()).toContain('font-light')
    expect(wrapper.classes()).not.toContain('font-normal')
    expect(wrapper.attributes('id')).toBe('t')
  })
})

describe('AppIcon', () => {
  it('renders the Iconsax icon, hidden from screen readers, in currentColor by default', async () => {
    const wrapper = mount(AppIcon, { props: { name: 'Add', size: 18 } })
    await iconsLoaded(wrapper)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('18')
    expect(wrapper.html()).toContain('currentColor')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})

describe('AppButton', () => {
  it('is a type="button" by default, with text and variant classes', () => {
    const wrapper = mount(AppButton, { props: { text: 'Save' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('Save')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['from-primary-orange-500', 'h-12']))
  })

  it('keeps an explicit type and other attrs, and merges the caller class', () => {
    const wrapper = mount(AppButton, {
      props: { size: '40' },
      attrs: { type: 'submit', class: 'h-14', 'data-x': '1' },
    })
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.attributes('data-x')).toBe('1')
    expect(wrapper.classes()).toContain('h-14')
    expect(wrapper.classes()).not.toContain('h-10')
  })

  it('fires click once, and not when disabled', async () => {
    const clicks: number[] = []
    const onClick = () => clicks.push(1)
    const enabled = mount(AppButton, { attrs: { onClick } })
    await enabled.trigger('click')
    expect(clicks).toHaveLength(1)

    const disabled = mount(AppButton, { props: { disabled: true }, attrs: { onClick } })
    expect(disabled.attributes('disabled')).toBeDefined()
  })

  it('shows a spinner with an announced label while loading, and is disabled', () => {
    const wrapper = mount(AppButton, {
      props: { text: 'Save', loading: true },
      ...withKit({ messages: { loading: 'Saving…' } }),
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.sr-only').text()).toBe('Saving…')
    expect(wrapper.text()).not.toContain('Save ')
  })

  it('renders an <a href> for `to` when no RouterLink is registered', () => {
    const wrapper = mount(AppButton, { props: { to: '/tasks', text: 'Tasks' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/tasks')
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it("uses the app's registered RouterLink for `to`", () => {
    const RouterLink = defineComponent({
      props: { to: { type: [String, Object], required: true } },
      setup:
        (p, { slots }) =>
        () =>
          h('a', { 'data-router': JSON.stringify(p.to) }, slots.default?.()),
    })
    const wrapper = mount(AppButton, {
      props: { to: { name: 'task', params: { id: 1 } } },
      global: { components: { RouterLink } },
    })
    expect(wrapper.attributes('data-router')).toBe('{"name":"task","params":{"id":1}}')
  })

  it('marks a disabled link with aria-disabled', () => {
    const wrapper = mount(AppButton, { props: { to: '/x', disabled: true } })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('places the icon with logical spacing: me-2 at the start, ms-2 at the end (mirrors in RTL)', async () => {
    const start = mount(AppButton, { props: { icon: 'Add', text: 'Add' } })
    await iconsLoaded(start)
    expect(start.find('svg').classes()).toContain('me-2')
    const end = mount(AppButton, { props: { icon: 'Add', text: 'Add', iconPosition: 'end' } })
    await iconsLoaded(end)
    expect(end.classes()).toContain('flex-row-reverse')
    expect(end.find('svg').classes()).toContain('ms-2')
  })

  it('warns in dev about an icon-only button without an accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(AppButton, { props: { icon: 'Trash', aspect: 'square' } })
    expect(warn).toHaveBeenCalledTimes(1)
    mount(AppButton, { props: { icon: 'Trash' }, attrs: { 'aria-label': 'Delete' } })
    mount(AppButton, { props: { icon: 'Trash', text: 'Delete' } })
    mount(AppButton, { props: { icon: 'Trash' }, slots: { default: 'Delete' } })
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('applies active classes for the variant', () => {
    const wrapper = mount(AppButton, { props: { variant: 'outline', active: true } })
    expect(wrapper.classes()).toContain('border-primary-orange-500!')
  })
})

describe('ZIndex', () => {
  it('names the z-* utilities defined in theme.css', () => {
    expect(ZIndex.TOASTS).toBe('z-toasts')
    expect(ZIndex.DIALOG_1).toBe('z-dialog-1')
  })
})
