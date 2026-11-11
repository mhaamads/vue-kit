// Toast queue and confirm state, ported from portal-iq-vue's toast store without Pinia:
// module-level reactive state, so useToast() works from plain modules and the HTTP client.
import { reactive, readonly } from 'vue'
import type { ButtonVariant } from './styles'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export type ToastOptions = {
  type: ToastKind
  /** Shown as text, never HTML. An array renders as a list. */
  message: string | string[]
  /** Milliseconds. Defaults to 3000; error toasts stay at least 10000 (portal). */
  duration?: number
  /** Stays until dismissed. */
  persistent?: boolean
  /** Runs when the toast or its action button is clicked; the toast then closes. */
  action?: () => void | Promise<void>
  actionLabel?: string
}

export type Toast = ToastOptions & { id: string }

export type ConfirmRequest = {
  type?: ToastKind
  title?: string
  message: string
  /** Text the user must type before confirming. */
  confirmText?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonVariant
  cancelVariant?: ButtonVariant
}

const MAX_TOASTS = 2

const state = reactive({
  toasts: [] as Toast[],
  confirm: undefined as ConfirmRequest | undefined,
})
let resolveConfirm: ((ok: boolean) => void) | undefined
// A counter, not crypto.randomUUID(): that only exists on HTTPS and localhost.
let lastId = 0

/** Read-only view for the AppToasts / AppConfirmDialog components and for tests. */
export const feedbackState = readonly(state)

export const dismissToast = (id: string) => {
  state.toasts = state.toasts.filter((toast) => toast.id !== id)
}

/** Queues a toast and returns its id. Only the newest two stay on screen. */
export const useToast = (options: ToastOptions): string => {
  const id = String(++lastId)
  state.toasts.push({ ...options, id })
  if (state.toasts.length > MAX_TOASTS) state.toasts.shift()

  if (!options.persistent) {
    const duration =
      options.type === 'error' ? Math.max(options.duration ?? 0, 10000) : (options.duration ?? 3000)
    setTimeout(() => dismissToast(id), duration)
  }
  return id
}

/**
 * Opens the confirm dialog and resolves `true` (confirm) or `false` (cancel, Escape).
 * A new request cancels one still open, so no caller waits forever (portal left it pending).
 */
export function useConfirm(request: ConfirmRequest): Promise<boolean>
export function useConfirm(
  message: string,
  options?: Omit<ConfirmRequest, 'message'>,
): Promise<boolean>
export function useConfirm(
  requestOrMessage: ConfirmRequest | string,
  options: Omit<ConfirmRequest, 'message'> = {},
): Promise<boolean> {
  resolveConfirm?.(false)
  state.confirm =
    typeof requestOrMessage === 'string'
      ? { ...options, message: requestOrMessage }
      : requestOrMessage
  return new Promise((resolve) => {
    resolveConfirm = resolve
  })
}

/** Closes the confirm dialog with the user's answer. Used by AppConfirmDialog. */
export const answerConfirm = (ok: boolean) => {
  const resolve = resolveConfirm
  resolveConfirm = undefined
  state.confirm = undefined
  resolve?.(ok)
}
