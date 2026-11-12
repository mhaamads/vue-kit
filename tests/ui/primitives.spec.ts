import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { AppButton, createVueKit, useVueKit } from '@mhaamads/vue-kit/ui'
import { defaultValidationMessages } from '@mhaamads/vue-kit/utils'

const ckb = { dir: 'rtl' as const, messages: { loading: 'بارکردن', close: 'داخستن' } }

// Renders the kit state the way a component would: destructured, read in the template.
const Probe = defineComponent({
  setup() {
    const { messages, dir, locale } = useVueKit()
    return () => h('pre', `${locale.value} ${dir.value} ${messages.loading} ${messages.close}`)
  },
})

afterEach(() => {
  document.documentElement.removeAttribute('lang')
  document.documentElement.removeAttribute('dir')
})

describe('createVueKit / useVueKit', () => {
  it('works without the plugin: English, LTR, and leaves <html> alone', () => {
    expect(mount(Probe).text()).toBe('en ltr Loading Close')
    expect(document.documentElement.getAttribute('dir')).toBeNull()
  })

  it('has English only by default, plus app options', () => {
    let config!: ReturnType<typeof useVueKit>
    const Grab = defineComponent({
      setup() {
        config = useVueKit()
        return () => null
      },
    })
    mount(Grab, { global: { plugins: [createVueKit()] } })
    expect(config.availableLocales.value).toEqual(['en'])
    expect(config.messages.required('Name')).toBe(defaultValidationMessages.required('Name'))
    expect(config.devBypassValidation()).toBe(false)
  })

  it('starts in the given locale, falling back to English for missing keys', () => {
    const kit = createVueKit({ locale: 'ckb', locales: { ckb } })
    expect(mount(Probe, { global: { plugins: [kit] } }).text()).toBe('ckb rtl بارکردن داخستن')
    expect(kit.messages.cancel).toBe('Cancel')
  })

  it('switches language and direction live, from inside or outside components', async () => {
    const kit = createVueKit({ locales: { ckb } })
    const wrapper = mount(Probe, { global: { plugins: [kit] } })
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    kit.setLocale('ckb')
    await nextTick()
    expect(wrapper.text()).toBe('ckb rtl بارکردن داخستن')
    expect(document.documentElement.getAttribute('lang')).toBe('ckb')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    kit.setLocale('en')
    await nextTick()
    expect(wrapper.text()).toBe('en ltr Loading Close')
  })

  it('adds a language at runtime (e.g. lazy-loaded) and can re-word English', async () => {
    const kit = createVueKit({ locales: { en: { messages: { close: 'Back' } } } })
    const wrapper = mount(Probe, { global: { plugins: [kit] } })
    expect(wrapper.text()).toBe('en ltr Loading Back')
    kit.addLocale('ckb', ckb)
    expect(kit.availableLocales.value).toEqual(['en', 'ckb'])
    kit.setLocale('ckb')
    kit.addLocale('ckb', { messages: { close: 'گەڕانەوە' } })
    await nextTick()
    expect(wrapper.text()).toBe('ckb rtl بارکردن گەڕانەوە')
  })

  it('warns and stays put on an unknown locale; syncDocument: false leaves <html> alone', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const kit = createVueKit({ syncDocument: false })
    mount(Probe, { global: { plugins: [kit] } })
    kit.setLocale('fr')
    expect(warn).toHaveBeenCalledWith('[vue-kit] Unknown locale "fr"')
    expect(kit.locale.value).toBe('en')
    expect(document.documentElement.getAttribute('dir')).toBeNull()
    warn.mockRestore()
  })
})

describe('AppButton (headless)', () => {
  it('takes its look from createVueKit({ ui: { button } }) by variant, plus its own class', () => {
    const plugins = [
      createVueKit({ ui: { button: { default: 'btn', primary: 'btn btn-primary' } } }),
    ]
    expect(mount(AppButton, { global: { plugins } }).classes()).toEqual(['btn'])
    const primary = mount(AppButton, {
      props: { variant: 'primary' },
      attrs: { class: 'w-full' },
      global: { plugins },
    })
    expect(primary.classes()).toEqual(['w-full', 'btn', 'btn-primary'])
  })

  it('is a plain type="button" with no classes; the slot is the content', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Save' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('class')).toBeUndefined()
    expect(wrapper.text()).toBe('Save')
  })

  it('passes class, type and attrs through', () => {
    const wrapper = mount(AppButton, { attrs: { type: 'submit', class: 'btn', 'data-x': '1' } })
    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.classes()).toEqual(['btn'])
    expect(wrapper.attributes('data-x')).toBe('1')
  })

  it('loading: disabled, aria-busy and data-loading; the slot gets `loading`', () => {
    const wrapper = mount(AppButton, {
      props: { loading: true },
      slots: { default: ({ loading }: { loading: boolean }) => (loading ? 'Saving…' : 'Save') },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('data-loading')).toBe('')
    expect(wrapper.text()).toBe('Saving…')
  })

  it('disabled sets data-disabled for styling', () => {
    expect(mount(AppButton, { props: { disabled: true } }).attributes('data-disabled')).toBe('')
  })

  it('renders an <a href> for `to` when no RouterLink is registered', () => {
    const wrapper = mount(AppButton, { props: { to: '/tasks' } })
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
    expect(
      mount(AppButton, { props: { to: '/x', disabled: true } }).attributes('aria-disabled'),
    ).toBe('true')
  })

  it('fires click once', async () => {
    const clicks: number[] = []
    const wrapper = mount(AppButton, { attrs: { onClick: () => clicks.push(1) } })
    await wrapper.trigger('click')
    expect(clicks).toHaveLength(1)
  })
})
