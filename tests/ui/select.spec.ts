import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { AppSelect, createVueKit } from '@moonlinetravel/vue-kit/ui'
import { contractUis } from './contract'

afterEach(() => {
  document.body.innerHTML = ''
})

const options = [
  { label: 'Erbil', value: 1, description: 'HQ' },
  { label: 'Baghdad', value: 2, disabled: true },
  { label: 'Basra', value: 3 },
  { label: 'Duhok', value: 4 },
]

// Minimal custom UI: may only bind what the field API gives it.
const minimalSelect = (f: any) =>
  h('div', [
    f.label ? h('label', f.labelProps, f.label) : null,
    f.searchable ? h('input', f.triggerProps) : h('div', f.triggerProps, f.displayText),
    f.open
      ? h(
          'ul',
          f.listboxProps,
          f.filteredOptions.map((o: any, i: number) => h('li', f.optionProps(o, i), o.label)),
        )
      : null,
    ...f.selectedOptions.map((o: any) => (f.multiple ? h('button', f.removeProps(o), 'x') : null)),
    f.error ? h('span', f.errorProps, f.error) : null,
  ])

const lastModel = (w: { emitted: (e: string) => unknown[][] | undefined }) =>
  w.emitted('update:modelValue')?.at(-1)?.[0]
const trigger = (w: any) => w.find('[role="combobox"]')
const key = (w: any, k: string) => trigger(w).trigger('keydown', { key: k })
const optionsShown = (w: any) => w.findAll('[role="option"]')

describe.each(contractUis(AppSelect, 'Select', minimalSelect))(
  'AppSelect (%s)',
  (ui, mountInput) => {
    it('opens on click and on ArrowDown; the trigger is a labelled, expanded combobox', async () => {
      const wrapper = mountInput({ props: { options, label: 'City', id: 'city' } })
      const box = trigger(wrapper)
      expect(wrapper.find('label').attributes('for')).toBe('city')
      expect(box.attributes('id')).toBe('city')
      expect(box.attributes('aria-expanded')).toBe('false')
      await box.trigger('click')
      expect(box.attributes('aria-expanded')).toBe('true')
      expect(box.attributes('aria-controls')).toBe('city-listbox')
      expect(wrapper.find('#city-listbox').attributes('role')).toBe('listbox')

      await key(wrapper, 'Escape')
      expect(box.attributes('aria-expanded')).toBe('false')
      await key(wrapper, 'ArrowDown')
      expect(box.attributes('aria-expanded')).toBe('true')
    })

    it('moves the highlight with arrows, Home and End, skipping disabled options', async () => {
      const wrapper = mountInput({ props: { options, id: 'c' } })
      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'ArrowDown')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-0')
      await key(wrapper, 'ArrowDown')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-2')
      await key(wrapper, 'End')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-3')
      await key(wrapper, 'ArrowDown')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-0')
      await key(wrapper, 'ArrowUp')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-3')
      await key(wrapper, 'Home')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('c-option-0')
    })

    it('selects with Enter, closes, and marks the option selected next time', async () => {
      const wrapper = mountInput({ props: { options } })
      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'ArrowDown')
      await key(wrapper, 'Enter')
      expect(lastModel(wrapper)).toBe(1)
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
      await trigger(wrapper).trigger('click')
      expect(optionsShown(wrapper)[0]!.attributes('aria-selected')).toBe('true')
    })

    it('selects with a click (mousedown keeps focus on the trigger), and ignores disabled options', async () => {
      const wrapper = mountInput({ props: { options } })
      await trigger(wrapper).trigger('click')
      const [, baghdad, basra] = optionsShown(wrapper)
      const down = new MouseEvent('mousedown', { cancelable: true })
      basra!.element.dispatchEvent(down)
      expect(down.defaultPrevented).toBe(true)
      await baghdad!.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(baghdad!.attributes('aria-disabled')).toBe('true')
      await basra!.trigger('click')
      expect(lastModel(wrapper)).toBe(3)
    })

    it('clears when the selected option is chosen again (portal optionsUnselectable default)', async () => {
      const wrapper = mountInput({ props: { options }, model: 1 })
      await trigger(wrapper).trigger('click')
      await optionsShown(wrapper)[0]!.trigger('click')
      expect(lastModel(wrapper)).toBeNull()

      const keep = mountInput({ props: { options, optionsUnselectable: false }, model: 1 })
      await trigger(keep).trigger('click')
      await optionsShown(keep)[0]!.trigger('click')
      expect(keep.emitted('update:modelValue')).toBeUndefined()
    })

    it('matches loosely like portal: "3" selects Basra', async () => {
      const wrapper = mountInput({ props: { options, searchable: false }, model: '3' })
      expect(trigger(wrapper).text()).toBe('Basra')
    })

    it('multiple: toggles values, stays open, and removes from a chip button', async () => {
      const wrapper = mountInput({ props: { options, multiple: true }, model: [] })
      await trigger(wrapper).trigger('click')
      expect(wrapper.find('[role="listbox"]').attributes('aria-multiselectable')).toBe('true')
      await optionsShown(wrapper)[0]!.trigger('click')
      expect(lastModel(wrapper)).toEqual([1])
      await optionsShown(wrapper)[2]!.trigger('click')
      expect(lastModel(wrapper)).toEqual([1, 3])
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
      await wrapper.find('button[aria-label="Remove Erbil"]').trigger('click')
      expect(lastModel(wrapper)).toEqual([3])
    })

    it('searches every field of an option (portal) through v-model:query', async () => {
      const onQuery = vi.fn()
      const wrapper = mountInput({ props: { options, 'onUpdate:query': onQuery } })
      const input = wrapper.find('input[role="combobox"]')
      await input.setValue('hq')
      expect(onQuery).toHaveBeenLastCalledWith('hq')
      await wrapper.setProps({ query: 'hq' })
      const found = optionsShown(wrapper)
      expect(found).toHaveLength(1)
      expect(found[0]!.text()).toContain('Erbil')
      expect(input.attributes('aria-autocomplete')).toBe('list')
    })

    it('lazy: asks for options on first open, then opens when they are ready', async () => {
      const onLoad = vi.fn()
      const wrapper = mountInput({ props: { lazy: true, onLoadOptions: onLoad } })
      await trigger(wrapper).trigger('click')
      expect(onLoad).toHaveBeenCalledTimes(1)
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')
      await wrapper.setProps({ options, isOptionsReady: true })
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    })

    it('a searchable select stays open when its input is clicked again', async () => {
      const wrapper = mountInput({ props: { options } })
      await trigger(wrapper).trigger('click')
      await trigger(wrapper).trigger('click')
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('true')
    })

    it('closes on blur; disabled never opens', async () => {
      const wrapper = mountInput({ props: { options } })
      await trigger(wrapper).trigger('click')
      await trigger(wrapper).trigger('blur')
      expect(trigger(wrapper).attributes('aria-expanded')).toBe('false')

      const disabled = mountInput({ props: { options, disabled: true } })
      await trigger(disabled).trigger('click')
      expect(trigger(disabled).attributes('aria-expanded')).toBe('false')
    })

    it('is invalid and described by its error', () => {
      const wrapper = mountInput({ props: { options, id: 's', errors: ['Pick a city.'] } })
      expect(trigger(wrapper).attributes('aria-invalid')).toBe('true')
      expect(trigger(wrapper).attributes('aria-describedby')).toBe('s-error')
    })

    it('non-searchable: Space opens, starts on the selected option, and selects', async () => {
      const wrapper = mountInput({ props: { options, searchable: false, id: 'n' }, model: 3 })
      expect(trigger(wrapper).attributes('tabindex')).toBe('0')
      await key(wrapper, ' ')
      expect(trigger(wrapper).attributes('aria-activedescendant')).toBe('n-option-2')
      await key(wrapper, 'ArrowDown')
      await key(wrapper, ' ')
      expect(lastModel(wrapper)).toBe(4)
    })
  },
)

describe('AppSelect default UI only', () => {
  it('renders only a window of rows for a long list (5,000 options)', async () => {
    const many = Array.from({ length: 5000 }, (item, i) => ({ label: `Option ${i}`, value: i }))
    const wrapper = mount(AppSelect, { props: { options: many }, attachTo: document.body })
    await trigger(wrapper).trigger('click')
    const rows = optionsShown(wrapper)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(30)
    expect(wrapper.find('[role="listbox"]').attributes('style')).toContain(`${5000 * 48}px`)
  })

  it('pressing the dropdown (e.g. its scrollbar) does not blur the trigger', async () => {
    const wrapper = mount(AppSelect, { props: { options }, attachTo: document.body })
    await trigger(wrapper).trigger('click')
    const popup = wrapper.find('[role="listbox"]').element.closest('.overflow-hidden')!
    const down = new MouseEvent('mousedown', { cancelable: true, bubbles: true })
    popup.dispatchEvent(down)
    expect(down.defaultPrevented).toBe(true)
  })

  it('shows empty, loading and no-results texts from messages, and the no-results slot', async () => {
    const wrapper = mount(AppSelect, {
      props: { options: [], query: 'zz' },
      attachTo: document.body,
      global: { plugins: [createVueKit({ messages: { noResults: 'هیچ ئەنجامێک نییە' } })] },
    })
    await trigger(wrapper).trigger('click')
    expect(wrapper.find('[role="status"]').text()).toBe('هیچ ئەنجامێک نییە')

    const slotted = mount(AppSelect, {
      props: { options: [] },
      slots: { 'no-results-found': () => h('em', 'Add a city first') },
      attachTo: document.body,
    })
    await trigger(slotted).trigger('click')
    expect(slotted.find('em').text()).toBe('Add a city first')
  })

  it('renders a custom option slot with selected state', async () => {
    const wrapper = mount(AppSelect, {
      props: { options, modelValue: 1 },
      slots: {
        option: ({ option, isSelected }: any) => h('b', `${option.label}${isSelected ? ' ✓' : ''}`),
      },
      attachTo: document.body,
    })
    await trigger(wrapper).trigger('click')
    await nextTick()
    expect(wrapper.find('b').text()).toBe('Erbil ✓')
  })

  it('limits chips and announces how many more are selected', () => {
    const wrapper = mount(AppSelect, {
      props: { options, multiple: true, modelValue: [1, 3, 4], selectedOptionsLimit: 1 },
    })
    expect(wrapper.findAll('button[aria-label^="Remove"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('2 more selected')
  })
})
