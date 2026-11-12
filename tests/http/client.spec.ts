import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpClient, HttpError, type HttpClientConfig } from '@mhaamads/vue-kit/http'

// Observed at the platform edge: a stubbed global fetch, plus a `notify` spy for toasts.
type Call = { url: string; init: RequestInit }
let calls: Call[]
let replies: Array<Response | Error>

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
const empty = (status = 204) => new Response(null, { status })

beforeEach(() => {
  calls = []
  replies = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url: String(url), init })
      const reply = replies.shift() ?? json({})
      if (reply instanceof Error) throw reply
      return reply
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

const setup = (config: Partial<HttpClientConfig> = {}) => {
  const notify = vi.fn()
  const http = createHttpClient({ baseUrls: { main: 'https://api.test/v1/' }, notify, ...config })
  return { http, notify }
}
const headersOf = (i = 0) => calls[i]!.init.headers as Record<string, string>

describe('URLs and params', () => {
  it('resolves the endpoint against the default (first) base URL', async () => {
    const { http } = setup()
    await http('users/1')
    expect(calls[0]!.url).toBe('https://api.test/v1/users/1')
  })

  it('picks a named base URL, accepts a function (e.g. API version), or a full override', async () => {
    let version = 'v1'
    const { http } = setup({
      baseUrls: { main: () => `https://api.test/${version}/`, report: 'https://report.test/' },
    })
    version = 'v2'
    await http('a')
    await http('b', { base: 'report' })
    await http('c', { baseUrl: 'https://other.test/' })
    await http('https://abs.test/d')
    expect(calls.map((c) => c.url)).toEqual([
      'https://api.test/v2/a',
      'https://report.test/b',
      'https://other.test/c',
      'https://abs.test/d',
    ])
  })

  it('drops empty params (portal) and keeps 0 and false', async () => {
    const { http } = setup()
    await http('list', { params: { a: undefined, b: null, c: '', d: 0, e: false, f: 'x y' } })
    expect(calls[0]!.url).toBe('https://api.test/v1/list?d=0&e=false&f=x+y')
  })
})

describe('headers and bodies', () => {
  it('adds getHeaders() (sync or async) and JSON content type; per-request headers win', async () => {
    const { http } = setup({
      getHeaders: async () => ({ Authorization: 'Bearer t', BranchCode: '1' }),
    })
    await http('x', { method: 'POST', body: { a: 1 }, headers: { BranchCode: '2' } })
    expect(headersOf()).toEqual({
      Authorization: 'Bearer t',
      BranchCode: '2',
      'Content-Type': 'application/json',
    })
    expect(calls[0]!.init.body).toBe('{"a":1}')
    expect(calls[0]!.init.method).toBe('POST')
    expect(calls[0]!.init.credentials).toBe('omit')
  })

  it('skips getHeaders for public requests', async () => {
    const getHeaders = vi.fn(() => ({ Authorization: 'Bearer t' }))
    const { http } = setup({ getHeaders })
    await http('login', { public: true })
    expect(getHeaders).not.toHaveBeenCalled()
    expect(headersOf().Authorization).toBeUndefined()
  })

  it('sends form-data without a content type, one entry per array item, skipping null', async () => {
    const { http } = setup()
    const file = new Blob(['x'])
    await http('upload', {
      method: 'POST',
      formType: 'form-data',
      body: { file, tags: ['a', 'b'], note: null, n: '1' },
    })
    const body = calls[0]!.init.body as FormData
    expect(headersOf()['Content-Type']).toBeUndefined()
    expect(body.getAll('tags')).toEqual(['a', 'b'])
    expect(body.has('note')).toBe(false)
    expect(body.get('n')).toBe('1')
    expect(body.get('file')).toBeInstanceOf(Blob)
  })

  it('passes a string body through unchanged', async () => {
    const { http } = setup()
    await http('raw', { method: 'PUT', body: '"quoted"' })
    expect(calls[0]!.init.body).toBe('"quoted"')
  })
})

describe('responses', () => {
  it('parses JSON by default, and blob or text on request', async () => {
    const { http } = setup()
    replies.push(json({ id: 1 }), new Response('a,b'), new Response('hello'))
    expect(await http<{ id: number }>('j')).toEqual({ id: 1 })
    expect(await http<Blob>('b', { responseType: 'blob' })).toBeInstanceOf(Blob)
    expect(await http<string>('t', { responseType: 'text' })).toBe('hello')
  })

  it('returns {} for 204, Content-Length 0, or responseIsEmpty', async () => {
    const { http } = setup()
    replies.push(
      empty(204),
      new Response('', { status: 200, headers: { 'Content-Length': '0' } }),
      new Response('ignored'),
    )
    expect(await http('a')).toEqual({})
    expect(await http('b')).toEqual({})
    expect(await http('c', { responseIsEmpty: true })).toEqual({})
  })
})

describe('errors', () => {
  it('throws HttpError with status, parsed data and the first field error as message', async () => {
    const { http, notify } = setup()
    replies.push(json({ errors: { Email: ['Email is taken.'] } }, 400))
    const error = await http<never>('x').catch((e: HttpError) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ status: 400, message: 'Email is taken.' })
    expect(error.data).toEqual({ errors: { Email: ['Email is taken.'] } })
    expect(notify).toHaveBeenCalledWith({
      type: 'error',
      message: 'Email is taken.',
      duration: 5000,
    })
  })

  it.each([
    [{ errors: ['First.', 'Second.'] }, 'First.'],
    [{ message: 'Not allowed.' }, 'Not allowed.'],
    [{}, 'HTTP 418: '],
  ])('formats %o as %o (portal formatErrorMessage)', async (data, message) => {
    const { http } = setup()
    replies.push(json(data, 418))
    await expect(http('x')).rejects.toMatchObject({ message })
  })

  it('turns a validation message list into a string array for the toast (no HTML)', async () => {
    const { http, notify } = setup()
    replies.push(
      json({ message: [{ validation: 'A is required.' }, { validation: 'B <b>x</b>' }] }, 400),
    )
    const error = await http<never>('x').catch((e: HttpError) => e)
    expect(notify.mock.calls[0]![0].message).toEqual(['A is required.', 'B <b>x</b>'])
    expect(error.message).toBe('A is required.\nB <b>x</b>')
  })

  it('uses the session-expired message for 401 and a custom errorMessage when given', async () => {
    const { http } = setup({ messages: { sessionExpired: 'Please sign in again.' } })
    replies.push(json({ message: 'raw' }, 401), json({ message: 'raw' }, 500))
    await expect(http('a')).rejects.toMatchObject({ status: 401, message: 'Please sign in again.' })
    await expect(http('b', { errorMessage: 'Could not save.' })).rejects.toMatchObject({
      message: 'Could not save.',
    })
  })

  it('reads messages from a function on every request, so they follow the app language', async () => {
    let lang = 'en'
    const { http } = setup({
      messages: () => ({
        sessionExpired: lang === 'en' ? 'Sign in again.' : 'دووبارە بچۆ ژوورەوە.',
      }),
    })
    replies.push(json({}, 401), json({}, 401))
    await expect(http('a')).rejects.toMatchObject({ message: 'Sign in again.' })
    lang = 'ckb'
    await expect(http('b')).rejects.toMatchObject({ message: 'دووبارە بچۆ ژوورەوە.' })
  })

  it('suppresses error toasts entirely or for listed statuses', async () => {
    const { http, notify } = setup()
    replies.push(json({}, 409), json({}, 409), json({}, 500))
    await http('a', { hideErrorToast: true }).catch(() => {})
    await http('b', { hideErrorToast: [409] }).catch(() => {})
    await http('c', { hideErrorToast: [409] }).catch(() => {})
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('throws HttpError status 0 on network failure, without a toast (portal)', async () => {
    const { http, notify } = setup()
    replies.push(new TypeError('Failed to fetch'))
    await expect(http('x')).rejects.toMatchObject({ status: 0, message: 'Failed to fetch' })
    expect(notify).not.toHaveBeenCalled()
  })

  it('lets beforeRequest refuse a request without sending it (portal email-required gate)', async () => {
    const { http, notify } = setup({
      beforeRequest: (endpoint) => {
        if (endpoint !== 'me/email') throw new HttpError(428, 'Email is required.')
      },
    })
    await expect(http('tasks')).rejects.toMatchObject({ status: 428 })
    await http('me/email')
    expect(calls.map((c) => c.url)).toEqual(['https://api.test/v1/me/email'])
    expect(notify).not.toHaveBeenCalled()
  })
})

describe('onError and retry', () => {
  it('can refresh a token and retry once with fresh headers (portal 401 refresh)', async () => {
    let token = 'old'
    const { http, notify } = setup({
      getHeaders: () => ({ Authorization: `Bearer ${token}` }),
      onError: async (error, retry) => {
        if (error.status !== 401) return
        token = 'new'
        return retry()
      },
    })
    replies.push(json({}, 401), json({ ok: true }))
    expect(await http('me')).toEqual({ ok: true })
    expect(calls.map((c) => (c.init.headers as Record<string, string>).Authorization)).toEqual([
      'Bearer old',
      'Bearer new',
    ])
    expect(notify).not.toHaveBeenCalled()
  })

  it('never retries more than once: a failed retry is thrown and toasted once', async () => {
    const onError = vi.fn((error: HttpError, retry: () => Promise<unknown>) => retry())
    const { http, notify } = setup({ onError })
    replies.push(json({}, 401), json({ message: 'Still no.' }, 401), json({}, 401))
    await expect(http('me')).rejects.toMatchObject({ status: 401 })
    expect(calls).toHaveLength(2)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('falls through to the normal error when onError returns nothing', async () => {
    const { http, notify } = setup({ onError: () => undefined })
    replies.push(json({ message: 'Nope.' }, 403))
    await expect(http('x')).rejects.toMatchObject({ status: 403, message: 'Nope.' })
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('propagates an error thrown by onError (e.g. logout) without a toast', async () => {
    const { http, notify } = setup({
      onError: () => {
        throw new Error('logged out')
      },
    })
    replies.push(json({}, 401))
    await expect(http('x')).rejects.toThrow('logged out')
    expect(notify).not.toHaveBeenCalled()
  })
})

describe('unparseable success responses', () => {
  it('throws HttpError (not SyntaxError) for HTML sent with 200, and shows no success toast', async () => {
    const { http, notify } = setup()
    replies.push(new Response('<html>Proxy error</html>', { status: 200 }))
    const error = await http<never>('x', { method: 'POST', showSuccessToast: true }).catch(
      (e: HttpError) => e,
    )
    expect(error).toBeInstanceOf(HttpError)
    expect(error.status).toBe(200)
    expect(notify).not.toHaveBeenCalled()
  })
})

describe('success toasts', () => {
  it('shows after a JSON response even without responseType (fixes portal bug)', async () => {
    const { http, notify } = setup()
    replies.push(json({ id: 1 }))
    await http('products', { method: 'POST', showSuccessToast: true, label: 'Product Owner' })
    expect(notify).toHaveBeenCalledWith({
      type: 'success',
      message: 'Product Owner created successfully.',
      duration: 3000,
    })
  })

  it('shows after a 204 with only a label (portal needed onSuccessMessage)', async () => {
    const { http, notify } = setup()
    replies.push(empty())
    await http('comments/1', { method: 'DELETE', showSuccessToast: true, label: 'Comment' })
    expect(notify.mock.calls[0]![0].message).toBe('Comment deleted successfully.')
  })

  it('uses successMessage, also for GET; and stays silent for GET without one', async () => {
    const { http, notify } = setup()
    replies.push(json({}), json({}))
    await http('sync', { showSuccessToast: true, successMessage: 'Synced.' })
    await http('list', { showSuccessToast: true })
    expect(notify.mock.calls.map((c) => c[0].message)).toEqual(['Synced.'])
  })

  it.each([
    ['PUT', 'Task updated successfully.'],
    ['PATCH', 'Task updated successfully.'],
  ] as const)('%s uses the "updated" default', async (method, message) => {
    const { http, notify } = setup()
    await http('t', { method, showSuccessToast: true, label: 'Task' })
    expect(notify.mock.calls[0]![0].message).toBe(message)
  })
})
