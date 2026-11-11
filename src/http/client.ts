// fetch-based client ported from portal-iq-vue's useHttp. portal's app-specific parts
// (auth store, branch headers, email-required gate, API-version retry, logout) become
// the getHeaders / beforeRequest / onError hooks.
import { useToast, type ToastOptions } from '../ui/feedback'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/** Error body shapes the portal backends return. */
export type ErrorResponse = {
  type?: string
  code?: string
  message?: string | { validation: string; attemptedValue?: unknown }[]
  field?: string
  /** Array of messages, or ASP.NET ValidationProblemDetails: field name → messages. */
  errors?: string[] | Record<string, string[]>
  [key: string]: unknown
}

/** Thrown for every failure. `status` is 0 for network errors. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: ErrorResponse | null = null,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export type RequestOptions = {
  method?: RequestMethod
  headers?: Record<string, string>
  body?: Record<string, unknown> | string
  /** Query params; undefined, null and '' are left out. */
  params?: Record<string, string | number | boolean | null | undefined>
  /** Name of a configured base URL. Defaults to the first one. */
  base?: string
  /** Full base URL, overriding `base`. */
  baseUrl?: string
  /** Skip `getHeaders` (no auth). */
  public?: boolean
  formType?: 'json' | 'form-data'
  responseType?: 'json' | 'blob' | 'text'
  /** Don't read a body even if one is sent. */
  responseIsEmpty?: boolean
  credentials?: RequestCredentials
  /** `true` hides every error toast; a list hides them for those statuses. */
  hideErrorToast?: boolean | number[]
  showSuccessToast?: boolean
  successMessage?: string
  /** Replaces the error text from the server. */
  errorMessage?: string
  /** Resource name for the default success text, e.g. "Task" → "Task created successfully." */
  label?: string
}

export const defaultHttpMessages = {
  sessionExpired: 'Your session has expired. Please log in again to continue.',
  success: (method: RequestMethod, label = 'Resource') =>
    method === 'POST'
      ? `${label} created successfully.`
      : method === 'PUT' || method === 'PATCH'
        ? `${label} updated successfully.`
        : method === 'DELETE'
          ? `${label} deleted successfully.`
          : `${label} request completed successfully.`,
}

export type HttpMessages = typeof defaultHttpMessages

export type HttpClientConfig = {
  /** Named base URLs; the first is the default. Functions are read on every request. */
  baseUrls: Record<string, string | (() => string)>
  /** Headers for every non-public request, e.g. the auth token. */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
  /** Runs before sending; throw (e.g. an HttpError) to refuse the request. */
  beforeRequest?: (endpoint: string, options: RequestOptions) => void | Promise<void>
  /**
   * Runs once when the server answers with an error. Return `retry()` to send the request
   * again (once; the retry never calls onError), return another value to resolve with it,
   * return nothing to throw the error as usual, or throw to replace it.
   */
  onError?: (error: HttpError, retry: () => Promise<unknown>) => unknown
  /** Shows toasts. Defaults to the kit's toast queue. */
  notify?: (toast: ToastOptions) => void
  messages?: Partial<HttpMessages>
}

const errorText = (data: ErrorResponse | null, response: Response, m: HttpMessages) => {
  if (response.status === 401) return m.sessionExpired
  const errors = data?.errors
  const first = Array.isArray(errors) ? errors[0] : Object.values(errors ?? {}).flat()[0]
  if (first) return first
  if (Array.isArray(data?.message)) return data.message.map((item) => item.validation)
  return data?.message || `HTTP ${response.status}: ${response.statusText}`
}

const formData = (body: Record<string, unknown>) => {
  const form = new FormData()
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue
    for (const item of Array.isArray(value) ? value : [value])
      form.append(key, item as Blob | string)
  }
  return form
}

export const createHttpClient = (config: HttpClientConfig) => {
  const m = { ...defaultHttpMessages, ...config.messages }
  const notify = config.notify ?? useToast
  const defaultBase = Object.keys(config.baseUrls)[0]

  const baseOf = (options: RequestOptions) => {
    if (options.baseUrl) return options.baseUrl
    const base = config.baseUrls[options.base ?? defaultBase ?? '']
    return typeof base === 'function' ? base() : (base ?? '')
  }

  const send = async <T>(
    endpoint: string,
    options: RequestOptions,
    allowOnError: boolean,
  ): Promise<T> => {
    const url = new URL(endpoint, baseOf(options))
    for (const [key, value] of Object.entries(options.params ?? {})) {
      if (value !== undefined && value !== null && value !== '')
        url.searchParams.append(key, String(value))
    }

    const isForm = options.formType === 'form-data'
    const headers: Record<string, string> = {
      ...(options.public ? {} : await config.getHeaders?.()),
      ...options.headers,
    }
    if (!isForm) headers['Content-Type'] = 'application/json'

    const body =
      options.body === undefined
        ? undefined
        : typeof options.body === 'string'
          ? options.body
          : isForm
            ? formData(options.body)
            : JSON.stringify(options.body)

    let response: Response
    try {
      response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers,
        body,
        credentials: options.credentials ?? 'omit',
      })
    } catch (error) {
      throw new HttpError(0, error instanceof Error ? error.message : 'Unknown error occurred')
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ErrorResponse | null
      const text = options.errorMessage ?? errorText(data, response, m)
      const error = new HttpError(
        response.status,
        Array.isArray(text) ? text.join('\n') : text,
        data,
      )

      if (allowOnError && config.onError) {
        const handled = await config.onError(error, () => send(endpoint, options, false))
        if (handled !== undefined) return handled as T
      }

      const hide = options.hideErrorToast
      if (!(hide === true || (Array.isArray(hide) && hide.includes(response.status)))) {
        notify({ type: 'error', message: text, duration: 5000 })
      }
      throw error
    }

    let data: T
    try {
      const isEmpty =
        response.status === 204 ||
        response.headers.get('Content-Length') === '0' ||
        options.responseIsEmpty
      data = isEmpty
        ? ({} as T)
        : options.responseType === 'blob'
          ? ((await response.blob()) as T)
          : options.responseType === 'text'
            ? ((await response.text()) as T)
            : ((await response.json()) as T)
    } catch (error) {
      // e.g. a proxy's HTML error page sent with 200.
      throw new HttpError(
        response.status,
        error instanceof Error ? error.message : 'Invalid response',
      )
    }

    const method = options.method ?? 'GET'
    if (options.showSuccessToast && (options.successMessage || method !== 'GET')) {
      notify({
        type: 'success',
        message: options.successMessage ?? m.success(method, options.label),
        duration: 3000,
      })
    }
    return data
  }

  /** `await http<User>('users/1')`. Throws HttpError on any failure. */
  return async <T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    await config.beforeRequest?.(endpoint, options)
    return send<T>(endpoint, options, true)
  }
}
