// Mount helpers: each component with v-model wired, the way an app uses it.
import type { Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  AppCheckbox,
  AppCheckboxGroup,
  AppDateInput,
  AppInput,
  AppRadioGroup,
  AppSelect,
  AppSwitch,
  AppTimeInput,
} from '@mhaamads/vue-kit/ui'

export type MountInput = (options?: {
  props?: Record<string, unknown>
  attrs?: Record<string, unknown>
  model?: unknown
  global?: Record<string, unknown>
}) => VueWrapper

const mountWith =
  (component: Component): MountInput =>
  ({ props = {}, attrs = {}, model, global } = {}) => {
    // Inputs that settle their model during mount emit before the wrapper exists; queue those.
    const box: { wrapper?: VueWrapper } = {}
    const onUpdate = (value: unknown) =>
      box.wrapper
        ? box.wrapper.setProps({ modelValue: value })
        : queueMicrotask(() => box.wrapper?.setProps({ modelValue: value }))
    box.wrapper = mount(component, {
      attachTo: document.body,
      props: { ...props, modelValue: model, 'onUpdate:modelValue': onUpdate },
      attrs,
      global,
    })
    return box.wrapper
  }

/** For describe.each: `[name, mountInput]`. */
export const suite = (mountInput: MountInput): [string, MountInput][] => [['default', mountInput]]

export const textField = mountWith(AppInput)
export const select = mountWith(AppSelect)
export const checkbox = mountWith(AppCheckbox)
export const switchInput = mountWith(AppSwitch)
export const radioGroup = mountWith(AppRadioGroup)
export const checkboxGroup = mountWith(AppCheckboxGroup)
export const dateField = mountWith(AppDateInput)
export const timeField = mountWith(AppTimeInput)
