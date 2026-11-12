// Toast queue and confirm state, without Pinia:
// module-level reactive state, so useToast() works from plain modules and the HTTP client.
import { reactive, readonly } from 'vue'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export type ToastOptions = {
  type: ToastKind
  /** Shown as text, never HTML. An array renders as a list. */
  message: string | string[]
  /** Milliseconds. Defaults to 3000; error toasts stay at least 10000. */
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
}

const MAX_TOASTS = 2

const state = reactive({
  toasts: [] as Toast[],
  confirm: undefined as ConfirmRequest | undefined,
})
let resolveConfirm: ((ok: boolean) => void) | undefined
// A counter, not crypto.randomUUID(): that only exists on HTTPS and localhost.
let lastId = 0
// On a server (Nuxt SSR) this module-level queue would be shared by every request, and nobody
// can see or answer it anyway, so toasts and confirms only run in the browser.
const onServer = typeof window === 'undefined'

/** Read-only view for the AppToasts / AppConfirmDialog components and for tests. */
export const feedbackState = readonly(state)

export const dismissToast = (id: string) => {
  state.toasts = state.toasts.filter((toast) => toast.id !== id)
}

/** Queues a toast and returns its id. Only the newest two stay on screen. No-op on a server. */
export const useToast = (options: ToastOptions): string => {
  if (onServer) return ''
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
 * A new request cancels one still open, so no caller waits forever. On a server it resolves `false`.
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
  if (onServer) return Promise.resolve(false)
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
