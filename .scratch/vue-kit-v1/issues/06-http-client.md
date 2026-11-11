# 06: HTTP client

**What to build:** An app developer creates one client with `createHttpClient(config)` and calls it from components, stores or modules. They plug in their own auth through `getHeaders`, `beforeRequest` and `onError(retry)`, and get typed results, one error type, and toasts that follow their per-request options.

**Blocked by:** 05 (Toasts and confirm).

**Status:** ready-for-agent

- [ ] Config: named `baseUrls` with a default, `getHeaders()` (sync or async), `beforeRequest` (may throw `HttpError`), `onError(error, retry)` (may retry once and return its result), and `notify` (defaults to the toast queue).
- [ ] Per-request options: method, body, params (empty values dropped), form type (JSON or form-data, arrays appended per item), response type (json, blob, text), credentials, public (no auth headers), hide-error-toast (boolean or status list), show-success-toast with message or label, empty-response flag, base-URL override.
- [ ] 204 and empty bodies return an empty object. Network failures throw `HttpError` with status 0. Non-OK responses throw `HttpError` with status and parsed data.
- [ ] Error message: the first field error, otherwise the message, otherwise a list of messages (as a string array), otherwise `HTTP <status>: <text>`.
- [ ] Retry: `onError` can resend once. A second failure is thrown, never retried forever.
- [ ] Regression: `showSuccessToast` shows a toast after a successful JSON response even when `responseType` is not set.
- [ ] Tests stub the global `fetch` and assert the requests sent, the results and the errors thrown.
- [ ] The HTTP option and error types are exported from `./http` (moved from ticket 03).
- [ ] No portal-specific logic: no branch headers, email gate, API-version retry or store reads.
