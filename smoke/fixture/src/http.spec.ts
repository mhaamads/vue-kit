import { expect, it, vi } from 'vitest'
import { createHttpClient, HttpError } from '@mhaamads/vue-kit/http'

it('calls fetch and throws HttpError from the installed package', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ message: 'Nope.' }), { status: 403 })),
  )
  const http = createHttpClient({ baseUrls: { main: 'https://api.test/' }, notify: () => {} })
  const error = await http<never>('x').catch((e: HttpError) => e)
  expect(error).toBeInstanceOf(HttpError)
  expect(error.status).toBe(403)
  vi.unstubAllGlobals()
})
