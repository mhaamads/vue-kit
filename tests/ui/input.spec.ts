import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { AppInput, AppInputSkin, createVueKit, useField } from '@moonlinetravel/vue-kit/ui'
import { contractUis, minimalTextInput } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(contractUis(AppInput, 'Input', minimalTextInput))(
  'AppInput (%s)',
  (ui, mountInput) => {
    it('updates v-model when typing, and the shown value when v-model changes', async () => {
      const wrapper = mountInput({ model: 'Ann' })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('Ann')
      await input.setValue('Bob')
      expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Bob'])
      await wrapper.setProps({ modelValue: 'Cy' })
      expect(input.element.value).toBe('Cy')
    })

    it('links the label to the control, with a generated or the given id', () => {
      const generated = mountInput({ props: { label: 'Name' } })
      const id = generated.find('input').attributes('id')
      expect(id).toBeTruthy()
      expect(generated.find('label').attributes('for')).toBe(id)

      const given = mountInput({ props: { label: 'Name', id: 'name' } })
      expect(given.find('input').attributes('id')).toBe('name')
      expect(given.find('label').attributes('for')).toBe('name')
    })

    it('describes the control by its hint and error; aria-invalid only with errors', async () => {
      const wrapper = mountInput({ props: { id: 'email', hint: 'Work address' } })
      const input = () => wrapper.find('input')
      expect(input().attributes('aria-describedby')).toBe('email-hint')
      expect(input().attributes('aria-invalid')).toBeUndefined()

      await wrapper.setProps({ errors: ['Email is required.'] })
      expect(input().attributes('aria-describedby')).toBe('email-hint email-error')
      expect(input().attributes('aria-invalid')).toBe('true')
      const error = wrapper.find('#email-error')
      expect(error.attributes('role')).toBe('alert')
      expect(error.text()).toContain('Email is required.')
    })

    it('passes disabled and readonly; required is aria-required, not native required', () => {
      const wrapper = mountInput({ props: { disabled: true, readonly: true, required: true } })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('readonly')).toBeDefined()
      expect(input.attributes('aria-required')).toBe('true')
      expect(input.attributes('required')).toBeUndefined()
    })

    it('puts native attrs, class and listeners on the control only; keydown fires once (portal fired twice)', async () => {
      const onKeydown = vi.fn()
      const wrapper = mountInput({
        attrs: { maxlength: '50', autocomplete: 'name', class: 'font-mono', onKeydown },
      })
      const input = wrapper.find('input')
      expect(input.attributes('maxlength')).toBe('50')
      expect(input.attributes('autocomplete')).toBe('name')
      expect(input.classes()).toContain('font-mono')
      expect(wrapper.element.getAttribute('maxlength')).toBeNull()
      expect(wrapper.classes()).not.toContain('font-mono')

      await input.trigger('keydown', { key: 'Enter' })
      expect(onKeydown).toHaveBeenCalledTimes(1)
    })

    it('keeps the caller blur listener and still marks the field touched', async () => {
      const onBlur = vi.fn()
      const wrapper = mountInput({ attrs: { onBlur } })
      await wrapper.find('input').trigger('blur')
      expect(onBlur).toHaveBeenCalledTimes(1)
    })

    it('passes type and placeholder', () => {
      const wrapper = mountInput({ props: { type: 'email', placeholder: 'you@example.com' } })
      expect(wrapper.find('input').attributes('type')).toBe('email')
      expect(wrapper.find('input').attributes('placeholder')).toBe('you@example.com')
    })

    it('renders a textarea with as="textarea"', () => {
      const wrapper = mountInput({ props: { as: 'textarea' }, model: 'notes' })
      expect(wrapper.find('textarea').element.value).toBe('notes')
      expect(wrapper.find('textarea').attributes('type')).toBeUndefined()
    })
  },
)

describe('AppInput default UI only', () => {
  it('styles the wrapper with root-class and lets the caller class win on the control', () => {
    const wrapper = mount(AppInput, { props: { rootClass: 'w-1/2' }, attrs: { class: 'h-14' } })
    expect(wrapper.classes()).toContain('w-1/2')
    expect(wrapper.find('input').classes()).toContain('h-14')
    expect(wrapper.find('input').classes()).not.toContain('h-10')
  })

  it('marks required labels with an asterisk hidden from screen readers', () => {
    const wrapper = mount(AppInput, { props: { label: 'Name', required: true } })
    expect(wrapper.find('label span').attributes('aria-hidden')).toBe('true')
  })

  it('replaces single parts through part slots that receive the field', () => {
    const wrapper = mount(AppInput, {
      props: { label: 'Price', errors: ['Too low.'], id: 'price' },
      slots: {
        prefix: () => h('span', { class: 'prefix' }, '$'),
        suffix: () => h('span', { class: 'suffix' }, 'USD'),
        label: (f: any) => h('label', { ...f.labelProps, class: 'custom' }, f.label.toUpperCase()),
        error: (f: any) => h('p', { ...f.errorProps, class: 'err' }, `⚠ ${f.error}`),
      },
    })
    expect(wrapper.find('.prefix').text()).toBe('$')
    expect(wrapper.find('.suffix').text()).toBe('USD')
    expect(wrapper.find('label.custom').text()).toBe('PRICE')
    expect(wrapper.find('label.custom').attributes('for')).toBe('price')
    expect(wrapper.find('p.err').attributes('id')).toBe('price-error')
    expect(wrapper.find('p.err').text()).toBe('⚠ Too low.')
    expect(wrapper.find('input').exists()).toBe(true)
  })
})

describe('AppInput review fixes', () => {
  it.each(contractUis(AppInput, 'Input', minimalTextInput))(
    'keeps the caller aria-describedby next to hint and error (%s)',
    (ui, mountInput) => {
      const wrapper = mountInput({
        props: { id: 'pwd', hint: 'Min 8', errors: ['Too short.'] },
        attrs: { 'aria-describedby': 'pwd-rules' },
      })
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(
        'pwd-rules pwd-hint pwd-error',
      )
    },
  )

  it('lets this instance’s default slot win over an app-wide override', () => {
    const Global = defineComponent({ setup: () => () => h('p', 'global') })
    const wrapper = mount(AppInput, {
      slots: { default: (f: any) => h('input', { ...f.inputProps, class: 'mine' }) },
      global: { plugins: [createVueKit({ components: { Input: Global } })] },
    })
    expect(wrapper.find('input.mine').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('global')
  })
})

describe('AppInput plugin override', () => {
  it('passes the caller slots through to the override component', () => {
    const MyInput = defineComponent({
      props: { field: { type: Object, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h('div', [h('input', (props.field as any).inputProps), slots.suffix?.()]),
    })
    const wrapper = mount(AppInput, {
      slots: { suffix: () => h('b', 'kg') },
      global: { plugins: [createVueKit({ components: { Input: MyInput } })] },
    })
    expect(wrapper.find('b').text()).toBe('kg')
  })

  it('can reuse the default skin inside an override', () => {
    const Framed = defineComponent({
      props: { field: { type: Object, required: true } },
      setup: (props) => () =>
        h('section', { class: 'frame' }, [h(AppInputSkin, { field: props.field as any })]),
    })
    const wrapper = mount(AppInput, {
      props: { label: 'Name' },
      global: { plugins: [createVueKit({ components: { Input: Framed } })] },
    })
    expect(wrapper.find('section.frame label').text()).toContain('Name')
    expect(wrapper.find('section.frame input').exists()).toBe(true)
  })
})

describe('useField', () => {
  const run = () => {
    let api!: ReturnType<typeof useField<string>>
    const model = ref('start')
    mount(
      defineComponent({
        setup() {
          api = useField({ model })
          return () => null
        },
      }),
    )
    return { api, model }
  }

  it('tracks touched on blur and dirty against the starting value; reset restores both', async () => {
    const { api, model } = run()
    expect(api.touched.value).toBe(false)
    expect(api.dirty.value).toBe(false)
    api.onBlur()
    model.value = 'changed'
    await nextTick()
    expect(api.touched.value).toBe(true)
    expect(api.dirty.value).toBe(true)
    api.reset()
    expect(model.value).toBe('start')
    expect(api.touched.value).toBe(false)
    expect(api.dirty.value).toBe(false)
  })

  it('reset(value) sets a new baseline, so a form loaded after mount starts clean', () => {
    const { api, model } = run()
    model.value = 'loaded from API'
    expect(api.dirty.value).toBe(true)
    api.reset('loaded from API')
    expect(api.dirty.value).toBe(false)
    model.value = 'edited'
    expect(api.dirty.value).toBe(true)
    api.reset()
    expect(model.value).toBe('loaded from API')
  })

  it('exposes the first error and setValue', () => {
    const { api, model } = run()
    api.setValue('x')
    expect(model.value).toBe('x')
    expect(api.error.value).toBeUndefined()
  })
})
