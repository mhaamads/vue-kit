import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import {
  AppCheckbox,
  AppCheckboxGroup,
  AppRadioGroup,
  AppSwitch,
  createVueKit,
} from '@moonlinetravel/vue-kit/ui'
import { contractUis } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

const lastModel = (wrapper: { emitted: (e: string) => unknown[][] | undefined }) =>
  wrapper.emitted('update:modelValue')?.at(-1)?.[0]

// Minimal custom UIs: they may only bind what the field API gives them.
const minimalChoice = (f: any) =>
  h('div', [
    h('label', [h('input', f.inputProps), f.label]),
    f.description ? h('small', f.descriptionProps, f.description) : null,
    f.error ? h('span', f.errorProps, f.error) : null,
  ])
const minimalGroup = (f: any) =>
  h('div', [
    f.label ? h('p', f.groupLabelProps, f.label) : null,
    h(
      'div',
      f.groupProps,
      f.options.map((o: any, i: number) =>
        h('label', f.itemLabelProps(o, i), [h('input', f.itemProps(o, i)), o.label]),
      ),
    ),
    f.error ? h('span', f.errorProps, f.error) : null,
  ])

const options = [
  { label: 'Lead', value: 1 },
  { label: 'Customer', value: 2 },
  { label: 'Archived', value: 3, disabled: true },
]

describe.each(contractUis(AppCheckbox, 'Checkbox', minimalChoice))(
  'AppCheckbox (%s)',
  (ui, mountInput) => {
    it('toggles a boolean model with a native checkbox', async () => {
      const wrapper = mountInput({ props: { label: 'Active' }, model: false })
      const input = wrapper.find('input[type="checkbox"]')
      expect((input.element as HTMLInputElement).checked).toBe(false)
      await input.trigger('change')
      expect(lastModel(wrapper)).toBe(true)
      expect((input.element as HTMLInputElement).checked).toBe(true)
      await input.trigger('change')
      expect(lastModel(wrapper)).toBe(false)
    })

    it('with `value`, holds the value when checked and undefined when not (portal)', async () => {
      const wrapper = mountInput({ props: { label: 'B2B', value: 'b2b' } })
      const input = wrapper.find('input')
      await input.trigger('change')
      expect(lastModel(wrapper)).toBe('b2b')
      await input.trigger('change')
      expect(lastModel(wrapper)).toBeUndefined()
    })

    it('uses custom true/false values', async () => {
      const wrapper = mountInput({
        props: { label: 'x', trueValue: 'Y', falseValue: 'N' },
        model: 'N',
      })
      await wrapper.find('input').trigger('change')
      expect(lastModel(wrapper)).toBe('Y')
    })

    it('does not change when disabled or readonly', async () => {
      const disabled = mountInput({ props: { label: 'x', disabled: true }, model: false })
      expect(disabled.find('input').attributes('disabled')).toBeDefined()
      const readonly = mountInput({ props: { label: 'x', readonly: true }, model: false })
      const input = readonly.find('input')
      expect(input.attributes('aria-readonly')).toBe('true')
      await input.trigger('change')
      expect(readonly.emitted('update:modelValue')).toBeUndefined()
      expect((input.element as HTMLInputElement).checked).toBe(false)
    })

    it('is described by its description and errors', () => {
      const wrapper = mountInput({
        props: {
          id: 'terms',
          label: 'Terms',
          description: 'Read them first',
          errors: ['Required.'],
        },
      })
      const input = wrapper.find('input')
      expect(input.attributes('aria-describedby')).toBe('terms-description terms-error')
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(wrapper.find('#terms-description').text()).toBe('Read them first')
    })
  },
)

describe.each(contractUis(AppSwitch, 'Switch', minimalChoice))(
  'AppSwitch (%s)',
  (ui, mountInput) => {
    it('is a native checkbox with role="switch"', async () => {
      const wrapper = mountInput({ props: { label: 'Notify' }, model: false })
      const input = wrapper.find('input')
      expect(input.attributes('role')).toBe('switch')
      await input.trigger('change')
      expect(lastModel(wrapper)).toBe(true)
    })

    it('settles an unknown starting value to "off" (portal)', () => {
      const wrapper = mountInput({ props: { trueValue: 'on', falseValue: 'off' } })
      expect(lastModel(wrapper)).toBe('off')
    })

    it('switches between custom values', async () => {
      const wrapper = mountInput({ props: { trueValue: 'yes', falseValue: 'no' }, model: 'no' })
      await wrapper.find('input').trigger('change')
      expect(lastModel(wrapper)).toBe('yes')
    })
  },
)

describe.each(contractUis(AppRadioGroup, 'RadioGroup', minimalGroup))(
  'AppRadioGroup (%s)',
  (ui, mountInput) => {
    it('selects the first option when the model starts empty (portal default)', () => {
      expect(lastModel(mountInput({ props: { options } }))).toBe(1)
      expect(
        lastModel(mountInput({ props: { options, selectFirstOption: false } })),
      ).toBeUndefined()
      expect(lastModel(mountInput({ props: { options }, model: 2 }))).toBeUndefined()
    })

    it('is a labelled radiogroup of native radios sharing one name (browser arrow keys)', () => {
      const wrapper = mountInput({ props: { options, label: 'Type', id: 'type' }, model: 1 })
      const group = wrapper.find('[role="radiogroup"]')
      expect(group.attributes('aria-labelledby')).toBe('type-label')
      expect(wrapper.find('#type-label').text()).toContain('Type')
      const radios = wrapper.findAll('input[type="radio"]')
      expect(new Set(radios.map((r) => r.attributes('name')))).toEqual(new Set(['type']))
      expect((radios[0]!.element as HTMLInputElement).checked).toBe(true)
    })

    it('selects on click, and ignores disabled options', async () => {
      const wrapper = mountInput({ props: { options }, model: 1 })
      const radios = wrapper.findAll('input')
      await radios[1]!.trigger('click')
      expect(lastModel(wrapper)).toBe(2)
      expect(radios[2]!.attributes('disabled')).toBeDefined()
    })

    it('selects on a bare change event, as arrow-key navigation produces (no click)', async () => {
      const wrapper = mountInput({ props: { options }, model: 1 })
      await wrapper.findAll('input')[1]!.trigger('change')
      expect(lastModel(wrapper)).toBe(2)
    })

    it('clears on a second click only with allowSelectionRemoval', async () => {
      const keep = mountInput({ props: { options }, model: 1 })
      await keep.findAll('input')[0]!.trigger('click')
      expect(keep.emitted('update:modelValue')).toBeUndefined()

      const clear = mountInput({ props: { options, allowSelectionRemoval: true }, model: 1 })
      const first = clear.findAll('input')[0]!
      await first.trigger('click')
      expect(lastModel(clear)).toBeUndefined()
      expect((first.element as HTMLInputElement).checked).toBe(false)
    })

    it('matches loosely, like portal: "2" selects the option with value 2', () => {
      const wrapper = mountInput({ props: { options }, model: '2' })
      expect((wrapper.findAll('input')[1]!.element as HTMLInputElement).checked).toBe(true)
    })

    it('marks the group and every radio invalid, so AppForm can focus one', () => {
      const wrapper = mountInput({ props: { options, errors: ['Pick one.'] }, model: 1 })
      expect(wrapper.find('[role="radiogroup"]').attributes('aria-invalid')).toBe('true')
      expect(wrapper.findAll('input').every((i) => i.attributes('aria-invalid') === 'true')).toBe(
        true,
      )
    })
  },
)

describe.each(contractUis(AppCheckboxGroup, 'CheckboxGroup', minimalGroup))(
  'AppCheckboxGroup (%s)',
  (ui, mountInput) => {
    it('adds and removes values in click order', async () => {
      const wrapper = mountInput({ props: { options }, model: [] })
      const boxes = wrapper.findAll('input[type="checkbox"]')
      await boxes[1]!.trigger('click')
      expect(lastModel(wrapper)).toEqual([2])
      await boxes[0]!.trigger('click')
      expect(lastModel(wrapper)).toEqual([2, 1])
      await boxes[1]!.trigger('click')
      expect(lastModel(wrapper)).toEqual([1])
    })

    it('is a group, and never picks a first option by itself', () => {
      const wrapper = mountInput({ props: { options, label: 'Tags' } })
      expect(wrapper.find('[role="group"]').exists()).toBe(true)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('ignores disabled options', async () => {
      const wrapper = mountInput({ props: { options }, model: [] })
      await wrapper.findAll('input')[2]!.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  },
)

describe('choice inputs, default UI only', () => {
  it('AppSwitch shows on/off labels from messages', () => {
    const wrapper = mount(AppSwitch, {
      props: { modelValue: true },
      global: { plugins: [createVueKit({ messages: { on: 'چالاک', off: 'ناچالاک' } })] },
    })
    expect(wrapper.text()).toContain('چالاک')
    expect(wrapper.text()).toContain('ناچالاک')
  })
})
