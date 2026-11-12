import {
  computed,
  inject,
  markRaw,
  provide,
  reactive,
  readonly,
  ref,
  type App,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { defaultValidationMessages, type ValidationMessages } from '../utils/validation/messages'
import type { VueKitUi } from './ui'

/** Built-in UI text. Every string a component shows or announces comes from here (ADR-0008). */
export const defaultUiMessages = {
  loading: 'Loading',
  am: 'AM',
  pm: 'PM',
  clear: 'Clear',
  notifications: 'Notifications',
  open: 'Open',
  close: 'Close',
  dismiss: 'Dismiss',
  copy: 'Copy',
  copied: 'Copied',
  showPassword: 'Show password',
  countryCode: 'Country code',
  selectOption: 'Select option',
  selectOptions: 'Select options',
  loadingOptions: 'Loading options...',
  noResults: 'No results found',
  noOptions: 'No options available',
  removeOption: (label: string) => `Remove ${label}`,
  moreSelected: (count: number) => `${count} more selected`,
  selectDate: 'Select date',
  clearDate: 'Clear date',
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

export type TextDirection = 'ltr' | 'rtl'

/** One language: its reading direction and texts. Missing texts fall back to English. */
export type VueKitLocale = {
  dir?: TextDirection
  messages?: Partial<VueKitMessages>
  /**
   * The date picker calendar's language: a date-fns locale, e.g. `import { ar } from
   * 'date-fns/locale'`. Without it the calendar stays English.
   */
  dateLocale?: object
}

export type VueKitOptions = {
  /** Starting language, a BCP 47 tag such as 'en', 'ar' or 'ckb'. Default 'en'. */
  locale?: string
  /** Extra languages. English ('en') is built in; an 'en' entry here overrides its texts. */
  locales?: Record<string, VueKitLocale>
  /** Write the current language and direction to <html lang dir> on every change. Default true. */
  syncDocument?: boolean
  /** Classes for every component, set once for the app. A component's own `ui` prop wins per key. */
  ui?: VueKitUi
  /** Return true to make <AppForm> skip validation (e.g. from your own dev tools). */
  devBypassValidation?: () => boolean
}

export type VueKitConfig = {
  /** The current language's texts. One reactive object, updated in place on every switch. */
  messages: VueKitMessages
  locale: Readonly<Ref<string>>
  dir: ComputedRef<TextDirection>
  /** The current language's date-fns locale for the calendar, if it has one. */
  dateLocale: ComputedRef<object | undefined>
  /** Every registered language, English included. */
  availableLocales: ComputedRef<string[]>
  /** Switch language at any time. Unknown names are ignored with a dev warning. */
  setLocale: (name: string) => void
  /** Register a language at runtime (e.g. after a lazy import); merges into an existing one. */
  addLocale: (name: string, locale: VueKitLocale) => void
  ui: VueKitUi
  devBypassValidation: () => boolean
}

const english: VueKitMessages = { ...defaultUiMessages, ...defaultValidationMessages }

const createConfig = (options: VueKitOptions = {}) => {
  // A date-fns locale is a big, fixed object: keep it out of Vue's reactivity (markRaw), so the
  // picker gets the object itself.
  const raw = (locale: VueKitLocale): VueKitLocale =>
    locale.dateLocale ? { ...locale, dateLocale: markRaw(locale.dateLocale) } : locale
  const locales = reactive<Record<string, VueKitLocale>>({
    en: { dir: 'ltr' },
    ...Object.fromEntries(Object.entries(options.locales ?? {}).map(([k, v]) => [k, raw(v)])),
  })
  const start = options.locale && options.locale in locales ? options.locale : 'en'
  // English first, so a key the language doesn't translate falls back to English.
  const texts = (name: string) =>
    ({ ...english, ...locales.en?.messages, ...locales[name]?.messages }) as VueKitMessages
  const current = ref(start)
  // One object updated in place: components that destructure `messages` keep following it.
  const messages = reactive(texts(start))
  const dir = computed<TextDirection>(() => locales[current.value]?.dir ?? 'ltr')
  const sync = options.syncDocument ?? true

  const apply = () => {
    Object.assign(messages, texts(current.value))
    if (sync && typeof document !== 'undefined') {
      document.documentElement.lang = current.value
      document.documentElement.dir = dir.value
    }
  }

  const setLocale = (name: string) => {
    if (!(name in locales)) {
      if (process.env.NODE_ENV !== 'production') console.warn(`[vue-kit] Unknown locale "${name}"`)
      return
    }
    current.value = name
    apply()
  }

  const addLocale = (name: string, locale: VueKitLocale) => {
    const existing = locales[name]
    locales[name] = {
      dir: locale.dir ?? existing?.dir,
      messages: { ...existing?.messages, ...locale.messages },
      dateLocale: locale.dateLocale ? markRaw(locale.dateLocale) : existing?.dateLocale,
    }
    if (name === current.value || name === 'en') apply()
  }

  const config: VueKitConfig = {
    messages,
    locale: readonly(current),
    dir,
    dateLocale: computed(() => locales[current.value]?.dateLocale),
    availableLocales: computed(() => Object.keys(locales)),
    setLocale,
    addLocale,
    ui: options.ui ?? {},
    devBypassValidation: options.devBypassValidation ?? (() => false),
  }
  return { config, apply }
}

const configKey: InjectionKey<VueKitConfig> = Symbol('vue-kit')
const defaults = createConfig({ syncDocument: false }).config

/**
 * `const kit = createVueKit({ ... }); app.use(kit)`. The returned kit also switches language from
 * anywhere (stores, router guards): `kit.setLocale('ar')`. Without the plugin, everything works
 * in English, left to right.
 */
export const createVueKit = (options: VueKitOptions = {}) => {
  const { config, apply } = createConfig(options)
  return {
    ...config,
    install(app: App) {
      app.provide(configKey, config)
      apply()
    },
  }
}

/**
 * Gives one part of the page its own kit, e.g. a preview in another language or direction:
 * `provideVueKit(createVueKit({ locale: 'ar', syncDocument: false }))` in that part's setup.
 */
export const provideVueKit = (kit: VueKitConfig) => provide(configKey, kit)

/** The active kit config. Call it in setup (components and composables). */
export const useVueKit = (): VueKitConfig => inject(configKey, defaults)
