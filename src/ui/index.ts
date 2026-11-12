// Public UI entry (ADR-0014): one component per field, unstyled, with a `ui` class map per piece.
// The composables behind them are exported for fully custom markup.
export {
  createVueKit,
  defaultUiMessages,
  useVueKit,
  type UiMessages,
  type TextDirection,
  type VueKitConfig,
  type VueKitLocale,
  type VueKitMessages,
  type VueKitOptions,
  provideVueKit,
} from './plugin'
export type {
  CheckboxUi,
  ChoiceGroupUi,
  ConfirmUi,
  DateInputUi,
  DialogUi,
  InputUi,
  PinInputUi,
  SelectUi,
  TimeInputUi,
  ToastsUi,
  VueKitUi,
} from './ui'

export { default as AppButton } from './AppButton.vue'
export { default as AppDialog } from './AppDialog.vue'
export { default as AppToasts } from './AppToasts.vue'
export { default as AppConfirmDialog } from './AppConfirmDialog.vue'
export {
  dismissToast,
  feedbackState,
  useConfirm,
  useToast,
  type ConfirmRequest,
  type Toast,
  type ToastKind,
  type ToastOptions,
} from './feedback'

export { default as AppForm } from './inputs/AppForm.vue'
export { default as AppInput } from './inputs/AppInput.vue'
export { default as AppSelect } from './inputs/AppSelect.vue'
export { default as AppCheckbox } from './inputs/AppCheckbox.vue'
export { default as AppSwitch } from './inputs/AppSwitch.vue'
export { default as AppRadioGroup } from './inputs/AppRadioGroup.vue'
export { default as AppCheckboxGroup } from './inputs/AppCheckboxGroup.vue'
export { default as AppDateInput } from './inputs/AppDateInput.vue'
export { default as AppPinInput } from './inputs/AppPinInput.vue'
export { default as AppTimeInput } from './inputs/AppTimeInput.vue'

export { useField, type FieldApi, type UseFieldOptions } from './inputs/use-field'
export {
  useTextInput,
  type TextInputApi,
  type TextInputField,
  type InputMask,
  type TextInputValue,
  type UseTextInputOptions,
} from './inputs/use-text-input'
export { countries, type Country } from './inputs/countries'
export {
  useChoice,
  useChoiceGroup,
  type ChoiceApi,
  type ChoiceField,
  type ChoiceGroupApi,
  type ChoiceGroupField,
  type ChoiceOption,
  type ChoiceValue,
  type UseChoiceGroupOptions,
  type UseChoiceOptions,
} from './inputs/use-choice'
export {
  useSelect,
  type SelectApi,
  type SelectField,
  type SelectOption,
  type UseSelectOptions,
} from './inputs/use-select'
export {
  formatDateValue,
  toDate,
  type DateInputValue,
  type DateLike,
  type DateMode,
  type MonthValue,
} from './inputs/date-value'
export {
  useTimeInput,
  type TimeColumnKind,
  type TimeInputApi,
  type TimeInputField,
  type TimeOption,
  type TimePreset,
  type TimeValue,
  type UseTimeInputOptions,
} from './inputs/use-time-input'
