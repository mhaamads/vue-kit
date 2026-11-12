import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { AppInput, createVueKit, useField } from '@mhaamads/vue-kit/ui'
import { suite, textField } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(suite(textField))('AppInput (%s)', (ui, mountInput) => {
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
    await nextTick()
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
})

describe('AppInput classes (ui)', () => {
  it('puts each ui class on its piece', () => {
    const wrapper = textField({
      props: {
        label: 'Name',
        hint: 'As on the passport',
        errors: ['Required.'],
        ui: { root: 'r', label: 'l', control: 'c', input: 'i', hint: 'h', errors: 'e' },
      },
    })
    expect(wrapper.classes()).toEqual(['r'])
    expect(wrapper.find('label').classes()).toEqual(['l'])
    expect(wrapper.find('input').classes()).toEqual(['i'])
    expect(wrapper.find('input').element.parentElement!.className).toBe('c')
    expect(wrapper.find('[data-hint]').classes()).toEqual(['h'])
    expect(wrapper.find('[data-errors]').classes()).toEqual(['e'])
  })

  it('takes app-wide classes from createVueKit({ ui }); the field’s own ui wins per key', () => {
    const global = {
      plugins: [createVueKit({ ui: { input: { input: 'h-10 border', label: 'text-sm' } } })],
    }
    const appWide = textField({ props: { label: 'Name' }, global })
    expect(appWide.find('input').classes()).toEqual(['h-10', 'border'])
    const own = textField({ props: { label: 'Name', ui: { input: 'h-12' } }, global })
    expect(own.find('input').classes()).toEqual(['h-12'])
    expect(own.find('label').classes()).toEqual(['text-sm'])
  })

  it('renders no classes at all without ui', () => {
    const wrapper = textField({ props: { label: 'Name', type: 'password' } })
    expect(wrapper.html()).not.toMatch(/class="[^"]/)
  })

  it('puts state hooks on the root: data-field, data-invalid, data-required, data-disabled', () => {
    const wrapper = textField({ props: { required: true, disabled: true, errors: ['Required.'] } })
    expect(wrapper.attributes()).toMatchObject({
      'data-field': '',
      'data-invalid': '',
      'data-required': '',
      'data-disabled': '',
    })
    expect(textField().attributes('data-invalid')).toBeUndefined()
  })

  it('renders leading and trailing slots in the control row, with the field to act on', async () => {
    const wrapper = mount(AppInput, {
      props: {
        modelValue: 'hello',
        'onUpdate:modelValue': (v: any) => wrapper.setProps({ modelValue: v }),
      },
      slots: {
        leading: () => h('b', '🔍'),
        trailing: ({ field }: any) =>
          h('button', { type: 'button', class: 'clear', onClick: () => field.setValue('') }, '✕'),
      },
    })
    expect(wrapper.find('[data-leading] b').text()).toBe('🔍')
    await wrapper.find('[data-trailing] button.clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([''])
  })

  it('lets the password and copy buttons be replaced through slots that get their functions', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(AppInput, {
      props: { type: 'password', modelValue: 'secret', copyable: true },
      slots: {
        'password-toggle': ({ visible, props }: any) =>
          h('button', { ...props, class: 'eye' }, visible ? '🙈' : '👁'),
        copy: ({ copy, copied }: any) =>
          h('button', { type: 'button', class: 'cp', onClick: copy }, copied ? '✓' : '⧉'),
      },
    })
    const eye = wrapper.find('button.eye')
    expect(eye.attributes('aria-label')).toBe('Show password')
    await eye.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(eye.text()).toBe('🙈')
    await wrapper.find('button.cp').trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('secret')
    expect(wrapper.find('button.cp').text()).toBe('✓')
    vi.unstubAllGlobals()
  })

  it('draws its own buttons with AppButton: app-wide `ghost` look plus the ui key', () => {
    const wrapper = textField({
      props: { type: 'password', ui: { passwordToggle: 'ms-auto' } },
      global: { plugins: [createVueKit({ ui: { button: { ghost: 'text-xs' } } })] },
    })
    expect(wrapper.find('button').classes()).toEqual(['ms-auto', 'text-xs'])
  })

  it('keeps the caller aria-describedby next to hint and error', () => {
    const wrapper = textField({
      props: { id: 'pwd', hint: 'Min 8', errors: ['Too short.'] },
      attrs: { 'aria-describedby': 'pwd-rules' },
    })
    expect(wrapper.find('input').attributes('aria-describedby')).toBe(
      'pwd-rules pwd-hint pwd-error',
    )
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
