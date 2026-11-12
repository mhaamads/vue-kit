# HTTP client

`createHttpClient`: `fetch` with your auth headers, error toasts and success messages built in.

```ts
// api.ts
import { createHttpClient } from '@mhaamads/vue-kit/http'

export const http = createHttpClient({
  baseUrls: { main: import.meta.env.VITE_API_URL },
  getHeaders: () => ({ Authorization: `Bearer ${auth.token}` }),
  timeout: 30_000, // optional: give up after 30 s
})

const tasks = await http<Task[]>('tasks', { params: { page: 1 } })
await http('tasks', { method: 'POST', body: task, showSuccessToast: true, label: 'Task' })
```

Errors throw an `HttpError` (`status`, `message`, `data`) and show a toast unless you pass
`hideErrorToast`.

## Cancel an old request

For search-as-you-type, cancel the previous request when a new one starts, so an old answer can't
replace a newer one:

```ts
let controller: AbortController | undefined

const search = async (query: string) => {
  controller?.abort()
  controller = new AbortController()
  try {
    results.value = await http('search', { params: { query }, signal: controller.signal })
  } catch (error) {
    if ((error as HttpError).reason !== 'aborted') throw error
  }
}
```

A cancelled request shows no toast and throws with `reason: 'aborted'`.

## Time limit

`timeout` (ms) on the client sets a default; on one request it overrides it:

```ts
await http('reports/big', { timeout: 120_000 })
```

When time runs out it throws with `reason: 'timeout'` and the message "The server took too long
to answer. Please try again." (translatable: `messages.timeout`).

## Options

| Option                                | What                                               |
| ------------------------------------- | -------------------------------------------------- |
| `method`, `body`, `params`, `headers` | The request                                        |
| `base` / `baseUrl`                    | Which API (named in `baseUrls`) or a full URL      |
| `public`                              | Don't send `getHeaders` (no auth)                  |
| `formType: 'form-data'`               | Send files                                         |
| `responseType`                        | `json` (default), `blob`, `text`                   |
| `showSuccessToast`, `label`           | "Task created successfully."                       |
| `hideErrorToast`                      | `true`, or a list of statuses                      |
| `signal`                              | Cancel the request                                 |
| `timeout`                             | Give up after this many ms                         |
