// Fixes from the package review: each test is a bug or gap that was found and closed.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AppDateInput,
  AppDialog,
  AppForm,
  AppInput,
  AppPinInput,
  AppSelect,
  AppTimeInput,
  AppToasts,
  createVueKit,
  dismissToast,
  feedbackState,
  useToast,
} from '@mhaamads/vue-kit/ui'
import { defineSchema, validate } from '@mhaamads/vue-kit/utils'
import { VueDatePicker } from '@vuepic/vue-datepicker'

afterEach(() => {
  feedbackState.toasts.forEach((t) => dismissToast(t.id))
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('style')
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// A page with toasts and a dialog, like an app.
const page = () => {
  const open = ref(false)
  const wrapper = mount(
    defineComponent({
      setup: () => () => [
        h(AppToasts),
        h(
          AppDialog,
          {
            modelValue: open.value,
            'onUpdate:modelValue': (v: boolean) => (open.value = v),
            title: 'Edit',
          },
          () => h('input', { 'aria-label': 'x' }),
        ),
      ],
    }),
    { attachTo: document.body },
  )
  return { wrapper, open }
}
const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('toasts and dialogs', () => {
  it('shows toasts inside the open dialog (above its backdrop), and back on the page after', async () => {
    const { open } = page()
    open.value = true
    await settle()
    useToast({ type: 'error', message: 'Save failed', persistent: true })
    await settle()
    expect(document.querySelector('dialog [data-toasts] [data-toast]')?.textContent).toContain(
      'Save failed',
    )
    open.value = false
    await settle()
    expect(document.querySelector('dialog [data-toasts]')).toBeNull()
    expect(document.querySelector('[data-toasts] [data-toast]')).not.toBeNull()
  })

  it('locks page scrolling while a dialog is open, and restores it', async () => {
    const { open } = page()
    open.value = true
    await settle()
    expect(document.documentElement.style.overflow).toBe('hidden')
    open.value = false
    await settle()
    expect(document.documentElement.style.overflow).toBe('')
  })
})

describe('AppForm and fields with their own rules', () => {
  it('blocks submit while a field’s own rules fail, and resetValidation() clears them', async () => {
    const onSubmit = vi.fn()
    const data = reactive({ email: 'not-an-email' })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(AppForm, { formData: data, onSubmit }, () =>
            h(AppInput, {
              id: 'email',
              label: 'Email',
              modelValue: data.email,
              'onUpdate:modelValue': (v: any) => (data.email = v),
              rules: { isEmail: true },
            }),
          ),
      }),
      { attachTo: document.body },
    )
    await wrapper.find('form').trigger('submit')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(wrapper.find('#email-error').text()).toContain('Email must be a valid email.')
    ;(wrapper.findComponent(AppForm).vm as any).resetValidation()
    await nextTick()
    expect(wrapper.find('#email-error').exists()).toBe(false)
    data.email = 'ann@example.com'
    await nextTick()
    await wrapper.find('form').trigger('submit')
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})

describe('AppInput debounce', () => {
  it('lets a value set from outside win over text still waiting to be sent', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AppInput, {
      props: {
        label: 'Search',
        debounce: 300,
        modelValue: 'a',
        'onUpdate:modelValue': (v: any) => wrapper.setProps({ modelValue: v }),
      },
    })
    await wrapper.find('input').setValue('typed')
    await wrapper.setProps({ modelValue: 'reset' })
    expect(wrapper.find('input').element.value).toBe('reset')
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(wrapper.props('modelValue')).toBe('reset')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('AppSelect', () => {
  const options = [
    { label: 'Erbil', value: 1 },
    { label: 'Basra', value: 2 },
    { label: 'Baghdad', value: 3, disabled: true },
  ]

  it('names a select without search by its label, with no stray disabled/readonly', () => {
    const wrapper = mount(AppSelect, {
      props: { label: 'City', id: 'c', searchable: false, options },
    })
    const trigger = wrapper.find('[role="combobox"]')
    expect(trigger.attributes('aria-labelledby')).toBe('c-label')
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(trigger.attributes('readonly')).toBeUndefined()
    const off = mount(AppSelect, {
      props: { label: 'City', searchable: false, disabled: true, options },
    })
    expect(off.find('[role="combobox"]').attributes('aria-disabled')).toBe('true')
  })

  it('highlights the first match while searching, so Enter picks it', async () => {
    const wrapper = mount(AppSelect, {
      props: {
        label: 'City',
        options,
        query: '',
        'onUpdate:query': (q: string) => wrapper.setProps({ query: q }),
      },
      attachTo: document.body,
    })
    const trigger = wrapper.find('[role="combobox"]')
    await trigger.trigger('click')
    await trigger.setValue('ba')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]]) // Basra; Baghdad is disabled
  })
})

describe('AppDateInput', () => {
  it('says whether the calendar is open, uses arrow keys, and gives focus back on close', async () => {
    const wrapper = mount(AppDateInput, { props: { label: 'Date' }, attachTo: document.body })
    const trigger = wrapper.find('button[aria-haspopup="dialog"]')
    const picker = wrapper.findComponent(VueDatePicker)
    expect(picker.props('arrowNavigation')).toBe(true)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    picker.vm.$emit('open')
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    ;(document.activeElement as HTMLElement | null)?.blur()
    picker.vm.$emit('closed')
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve))
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
  })

  it('gives the calendar the current language’s date locale', async () => {
    const ar = { code: 'ar' }
    const kit = createVueKit({
      syncDocument: false,
      locales: { ar: { dir: 'rtl', dateLocale: ar } },
    })
    const wrapper = mount(AppDateInput, { props: { label: 'Date' }, global: { plugins: [kit] } })
    // English has no date locale here, so the picker uses its own default (English).
    expect(wrapper.findComponent(VueDatePicker).props('locale')).not.toBe(ar)
    kit.setLocale('ar')
    await nextTick()
    expect(wrapper.findComponent(VueDatePicker).props('locale')).toBe(ar)
  })
})

describe('AppTimeInput', () => {
  it('takes AM / PM from the language', async () => {
    const kit = createVueKit({ locales: { en: { messages: { am: 'پ.ن', pm: 'د.ن' } } } })
    const wrapper = mount(AppTimeInput, {
      props: { label: 'Time', format: 12, modelValue: { hours: 21, minutes: 5 } },
      global: { plugins: [kit] },
      attachTo: document.body,
    })
    expect(wrapper.find('button[aria-haspopup="dialog"]').text()).toBe('09:05 د.ن')
    await wrapper.find('button[aria-haspopup="dialog"]').trigger('click')
    expect(wrapper.findAll('[data-kind="period"] [role="radio"]').map((b) => b.text())).toEqual([
      'پ.ن',
      'د.ن',
    ])
  })
})

describe('validation: accepted', () => {
  it('needs exactly true; required still accepts false and 0 as answers', () => {
    const schema = defineSchema<{ terms: unknown; active: boolean; count: number }>({
      terms: { accepted: true, label: 'Terms' },
      active: { required: true },
      count: { required: true },
    })
    expect(validate(schema, { terms: false, active: false, count: 0 })).toEqual({
      terms: ['Terms must be accepted.'],
    })
    expect(validate(schema, { terms: undefined, active: true, count: 1 })).toEqual({
      terms: ['Terms must be accepted.'],
    })
    expect(validate(schema, { terms: true, active: false, count: 0 })).toEqual({})
  })
})

describe('AppPinInput', () => {
  it('shows only digits even when its value is set from code', () => {
    const wrapper = mount(AppPinInput, {
      props: { label: 'Code', length: 4, modelValue: 'ab-١٢34' },
    })
    expect(wrapper.findAll('[data-cell]').map((c) => c.text())).toEqual(['1', '2', '3', '4'])
  })
})

describe('unlabelled fields', () => {
  it('warns in development when nobody can name the field, and not when they can', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(AppInput, { props: { id: 'nameless' }, attachTo: document.body })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"nameless" has no label'))
    warn.mockClear()
    mount(AppInput, { props: { label: 'Name' }, attachTo: document.body })
    mount(AppInput, { attrs: { 'aria-label': 'Search' }, attachTo: document.body })
    expect(warn).not.toHaveBeenCalled()
  })
})
