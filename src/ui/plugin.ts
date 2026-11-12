import { inject, type App, type Component, type InjectionKey } from 'vue'
import { defaultValidationMessages, type ValidationMessages } from '../utils/validation/messages'

/** Built-in UI text. Every string a component shows or announces comes from here (ADR-0008). */
export const defaultUiMessages = {
  loading: 'Loading',
  notifications: 'Notifications',
  open: 'Open',
  close: 'Close',
  dismiss: 'Dismiss',
  copy: 'Copy',
  copied: 'Copied',
  showPassword: 'Show password',
  countryCode: 'Country code',
  on: 'On',
  off: 'Off',
  selectOption: 'Select option',
  selectOptions: 'Select options',
  loadingOptions: 'Loading options...',
  noResults: 'No results found',
  noOptions: 'No options available',
  removeOption: (label: string) => `Remove ${label}`,
  moreSelected: (count: number) => `${count} more selected`,
  dateNotAllowed: 'This date is not available.',
  clearDate: 'Clear date',
  startDate: 'Start date',
  endDate: 'End date',
  time: 'Time',
  hours: 'Hours',
  minutes: 'Minutes',
  period: 'AM/PM',
  now: 'Now',
  ok: 'OK',
  clearTime: 'Clear time',
  confirmTitle: 'Confirm',
  confirm: 'Confirm',
  cancel: 'Cancel',
  typeToConfirm: (phrase: string) => `Type "${phrase}" to proceed`,
}

export type UiMessages = typeof defaultUiMessages
export type VueKitMessages = UiMessages & ValidationMessages

/** Inputs whose default UI can be replaced app-wide (design doc, override level 4). */
export type OverridableInput =
  | 'Input'
  | 'Select'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'RadioGroup'
  | 'Switch'
  | 'DateInput'
  | 'TimeInput'

export type VueKitOptions = {
  /** Reading direction for components that need it in JS; CSS uses logical properties. */
  dir?: 'ltr' | 'rtl'
  /** Overrides merged over the English defaults. */
  messages?: Partial<VueKitMessages>
  components?: Partial<Record<OverridableInput, Component>>
  /** Return true to make <AppForm> skip validation (e.g. from your own dev tools). */
  devBypassValidation?: () => boolean
}

export type VueKitConfig = Required<Omit<VueKitOptions, 'messages'>> & { messages: VueKitMessages }

const resolve = (options: VueKitOptions): VueKitConfig => ({
  dir: options.dir ?? 'ltr',
  messages: { ...defaultUiMessages, ...defaultValidationMessages, ...options.messages },
  components: options.components ?? {},
  devBypassValidation: options.devBypassValidation ?? (() => false),
})

const configKey: InjectionKey<VueKitConfig> = Symbol('vue-kit')
const defaults = resolve({})

/** `app.use(createVueKit({ ... }))`. Everything works without it, with English LTR defaults. */
export const createVueKit = (options: VueKitOptions = {}) => ({
  install(app: App) {
    app.provide(configKey, resolve(options))
  },
})

/** The active kit config. Call it in setup (components, composables, overrides). */
export const useVueKit = (): VueKitConfig => inject(configKey, defaults)
