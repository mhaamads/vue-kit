// @vitest-environment node
// Nuxt renders on the server first: every component must render to HTML without a DOM.
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  AppButton,
  AppCheckbox,
  AppCheckboxGroup,
  AppConfirmDialog,
  AppDateInput,
  AppDialog,
  AppForm,
  AppInput,
  AppPinInput,
  AppRadioGroup,
  AppSelect,
  AppSwitch,
  AppTimeInput,
  AppToasts,
  createVueKit,
  useConfirm,
  useToast,
} from '@mhaamads/vue-kit/ui'

const options = [
  { label: 'A', value: 1 },
  { label: 'B', value: 2 },
]

const render = (node: () => ReturnType<typeof h>) =>
  renderToString(
    createSSRApp({ render: node }).use(createVueKit({ ui: { input: { input: 'x' } } })),
  )

describe('server rendering (Nuxt)', () => {
  it.each([
    [
      'AppInput',
      () => h(AppInput, { label: 'Name', hint: 'Hint', type: 'password', copyable: true }),
    ],
    ['AppSelect', () => h(AppSelect, { label: 'City', options, multiple: true, modelValue: [1] })],
    ['AppCheckbox', () => h(AppCheckbox, { label: 'Ok' })],
    ['AppSwitch', () => h(AppSwitch, { label: 'On' })],
    ['AppRadioGroup', () => h(AppRadioGroup, { label: 'Pick', options })],
    ['AppCheckboxGroup', () => h(AppCheckboxGroup, { label: 'Pick', options })],
    ['AppDateInput', () => h(AppDateInput, { label: 'Date', range: true })],
    ['AppTimeInput', () => h(AppTimeInput, { label: 'Time' })],
    ['AppButton', () => h(AppButton, { to: '/x' }, () => 'Go')],
    ['AppDialog', () => h(AppDialog, { modelValue: true, title: 'Hi' }, () => 'Body')],
    ['AppToasts', () => h(AppToasts)],
    ['AppConfirmDialog', () => h(AppConfirmDialog)],
    ['AppForm', () => h(AppForm, { formData: {}, warnUnsaved: true }, () => 'fields')],
    ['AppPinInput', () => h(AppPinInput, { label: 'Code', length: 4, modelValue: '12' })],
    [
      'AppInput with options',
      () => h(AppInput, { clearable: true, counter: true, loading: true, modelValue: 'x' }),
    ],
  ])('renders %s to HTML without a DOM', async (name, node) => {
    const html = await render(node)
    expect(html.length).toBeGreaterThan(0)
  })

  it('renders labels linked to their control with SSR-stable ids, and app-wide classes', async () => {
    const html = await render(() => h(AppInput, { label: 'Name' }))
    const id = html.match(/<label id="[^"]*" for="([^"]+)"/)![1]
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('class="x"')
  })

  it('toasts and confirms are no-ops on the server (no state shared between requests)', async () => {
    expect(useToast({ type: 'info', message: 'x' })).toBe('')
    await expect(useConfirm('Sure?')).resolves.toBe(false)
  })
})
