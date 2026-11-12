// How a field with its own `rules` takes part in the AppForm around it: the form runs every
// registered check on submit (and blocks it if one fails) and clears them on resetValidation().
import { inject, onScopeDispose, type InjectionKey } from 'vue'

export type FieldCheck = {
  /** Shows the field's errors; true when valid. */
  validate: () => boolean
  /** Hides the field's errors. */
  reset: () => void
}

export type FormContext = { register: (check: FieldCheck) => () => void }
export const formKey: InjectionKey<FormContext> = Symbol('vue-kit-form')

/** Registers the check with the surrounding AppForm (if any) for as long as the field lives. */
export const useFormField = (check: FieldCheck) => {
  const form = inject(formKey, null)
  if (form) onScopeDispose(form.register(check))
}
