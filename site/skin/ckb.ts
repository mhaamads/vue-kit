import type { VueKitLocale } from '../../src/ui'

// Demo Central Kurdish (Sorani) locale for the docs' language example. Some validation
// keys are left out on purpose: missing keys fall back to English.
const name = (field?: string) => field ?? 'بەها'

export const ckb: VueKitLocale = {
  dir: 'rtl',
  messages: {
    loading: 'بارکردن',
    notifications: 'ئاگادارکردنەوەکان',
    open: 'کردنەوە',
    close: 'داخستن',
    dismiss: 'لابردن',
    copy: 'کۆپی',
    copied: 'کۆپی کرا',
    showPassword: 'پیشاندانی وشەی نهێنی',
    countryCode: 'کۆدی وڵات',
    selectOption: 'هەڵبژاردنێک بکە',
    selectOptions: 'هەڵبژاردنەکان بکە',
    loadingOptions: 'بارکردنی هەڵبژاردنەکان...',
    noResults: 'هیچ ئەنجامێک نەدۆزرایەوە',
    noOptions: 'هیچ هەڵبژاردنێک نییە',
    removeOption: (label) => `لابردنی ${label}`,
    moreSelected: (count) => `${count} ی تر هەڵبژێردراوە`,
    selectDate: 'ڕۆژێک هەڵبژێرە',
    clearDate: 'سڕینەوەی ڕۆژ',
    time: 'کات',
    hours: 'کاتژمێر',
    minutes: 'خولەک',
    period: 'پ.ن/د.ن',
    now: 'ئێستا',
    ok: 'باشە',
    clearTime: 'سڕینەوەی کات',
    confirmTitle: 'دڵنیاکردنەوە',
    confirm: 'دڵنیاکردنەوە',
    cancel: 'هەڵوەشاندنەوە',
    typeToConfirm: (phrase) => `"${phrase}" بنووسە بۆ بەردەوامبوون`,
    required: (field) => `${name(field)} پێویستە.`,
    isEmail: (field) => `${name(field)} دەبێت ئیمەیڵێکی دروست بێت.`,
    minLength: (min, field) => `${name(field)} دەبێت لانیکەم ${min} پیت بێت.`,
    maxLength: (max, field) => `${name(field)} دەبێت زۆرترین ${max} پیت بێت.`,
  },
}
