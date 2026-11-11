// The input contract harness (design doc §6). Every input's suite runs against three UIs:
// the default skin, a minimal slot override (level 3) and a minimal plugin override (level 4).
// A case that passes on one and fails on another means behaviour leaked into a template.
import { defineComponent, h, type Component, type VNodeChild } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createVueKit, type OverridableInput } from '@moonlinetravel/vue-kit/ui'

export type MountInput = (options?: {
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  model?: unknown
}) => VueWrapper

/**
 * @param render the minimal custom UI: it may only bind what the field API gives it.
 * Returns `[name, mountInput]` pairs for `describe.each`.
 */
export const contractUis = (
  component: Component,
  key: OverridableInput,
  render: (field: any) => VNodeChild,
): [string, MountInput][] => {
  const MinimalOverride = defineComponent({
    props: { field: { type: Object, required: true } },
    setup: (props) => () => render(props.field),
  })

  const mountWith =
    (extra: Record<string, unknown>): MountInput =>
    ({ props = {}, attrs = {}, model } = {}) => {
      const wrapper: VueWrapper = mount(component, {
        attachTo: document.body,
        props: {
          ...props,
          modelValue: model,
          'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value }),
        },
        attrs,
        ...extra,
      })
      return wrapper
    }

  return [
    ['default UI', mountWith({})],
    ['slot override', mountWith({ slots: { default: (field: any) => render(field) } })],
    [
      'plugin override',
      mountWith({
        global: { plugins: [createVueKit({ components: { [key]: MinimalOverride } })] },
      }),
    ],
  ]
}

/** Minimal text-input UI: bare label, control, hint and error, bound from the field API. */
export const minimalTextInput = (f: any) =>
  h('div', [
    f.label ? h('label', f.labelProps, f.label) : null,
    h(f.as, f.inputProps),
    f.hint ? h('small', f.hintProps, f.hint) : null,
    f.error ? h('span', f.errorProps, f.error) : null,
  ])
