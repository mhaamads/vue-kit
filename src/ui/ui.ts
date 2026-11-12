// Class maps (ADR-0014). Components render unstyled markup; every piece takes its classes from a
// `ui` map. `createVueKit({ ui })` sets them for the whole app; a component's own `ui` prop wins,
// key by key (no merging inside a key, so `h-12` simply replaces `h-10`).
import { computed } from 'vue'
import { useVueKit } from './plugin'

type Classes<K extends string> = Partial<Record<K, string>>
type Field = 'root' | 'label' | 'hint' | 'errors'

export type InputUi = Classes<
  | Field
  | 'control'
  | 'input'
  | 'leading'
  | 'trailing'
  | 'passwordToggle'
  | 'copy'
  | 'clear'
  | 'loading'
  | 'counter'
  // type="tel": the dial-code picker
  | 'country'
  | 'countryTrigger'
  | 'countryMenu'
  | 'countryOption'
>
export type SelectUi = Classes<
  | Field
  | 'chips'
  | 'chip'
  | 'chipRemove'
  | 'chipMore'
  | 'control'
  | 'leading'
  | 'trailing'
  | 'trigger'
  | 'content'
  | 'option'
  | 'optionDescription'
  | 'empty'
>
export type CheckboxUi = Classes<Field | 'input' | 'description'>
export type PinInputUi = Classes<Field | 'control' | 'input' | 'cell'>
export type ChoiceGroupUi = Classes<Field | 'group' | 'item' | 'itemInput' | 'itemDescription'>
export type DateInputUi = Classes<Field | 'control' | 'trigger' | 'leading' | 'trailing' | 'clear'>
export type TimeInputUi = Classes<
  | Field
  | 'control'
  | 'leading'
  | 'trailing'
  | 'trigger'
  | 'clear'
  | 'panel'
  | 'presets'
  | 'preset'
  | 'column'
  | 'option'
  | 'now'
  | 'ok'
>
export type DialogUi = Classes<'root' | 'panel' | 'header' | 'title' | 'close' | 'body' | 'footer'>
export type ToastsUi = Classes<
  'root' | 'toast' | 'message' | 'actions' | 'copy' | 'action' | 'close'
>
export type ConfirmUi = Classes<'root' | 'title' | 'message' | 'actions' | 'cancel' | 'confirm'>

/**
 * Button looks by variant name. The kit's own buttons use `primary` (confirm, OK), `secondary`
 * (cancel), `danger` (confirming an error-type request) and `ghost` (show password, copy, clear,
 * close, toast actions); `<AppButton>` uses `default` unless you pass a `variant`. Add any other
 * names you like.
 */
export type ButtonUi = Partial<
  Record<'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | (string & {}), string>
>

/** App-wide classes, one map per component. */
export type VueKitUi = {
  button?: ButtonUi
  input?: InputUi
  select?: SelectUi
  checkbox?: CheckboxUi
  switch?: CheckboxUi
  radioGroup?: ChoiceGroupUi
  checkboxGroup?: ChoiceGroupUi
  pinInput?: PinInputUi
  dateInput?: DateInputUi
  timeInput?: TimeInputUi
  dialog?: DialogUi
  toasts?: ToastsUi
  confirm?: ConfirmUi
}

/** The component's classes: app-wide map, then its own `ui` prop on top. */
export const useUi = <K extends keyof VueKitUi>(name: K, own: () => VueKitUi[K]) => {
  const { ui } = useVueKit()
  return computed(() => ({ ...ui[name], ...own() }) as NonNullable<VueKitUi[K]>)
}
