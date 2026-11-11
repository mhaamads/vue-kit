# 06: HTTP client

**What to build:** An app developer creates one client with `createHttpClient(config)` and calls it from components, stores or modules. They plug in their own auth through `getHeaders`, `beforeRequest` and `onError(retry)`, and get typed results, one error type, and toasts that follow their per-request options.

**Blocked by:** 05 (Toasts and confirm).

**Status:** resolved

- [x] Config: named `baseUrls` with a default, `getHeaders()` (sync or async), `beforeRequest` (may throw `HttpError`), `onError(error, retry)` (may retry once and return its result), and `notify` (defaults to the toast queue).
- [x] Per-request options: method, body, params (empty values dropped), form type (JSON or form-data, arrays appended per item), response type (json, blob, text), credentials, public (no auth headers), hide-error-toast (boolean or status list), show-success-toast with message or label, empty-response flag, base-URL override.
- [x] 204 and empty bodies return an empty object. Network failures throw `HttpError` with status 0. Non-OK responses throw `HttpError` with status and parsed data.
- [x] Error message: the first field error, otherwise the message, otherwise a list of messages (as a string array), otherwise `HTTP <status>: <text>`.
- [x] Retry: `onError` can resend once. A second failure is thrown, never retried forever.
- [x] Regression: `showSuccessToast` shows a toast after a successful JSON response even when `responseType` is not set.
- [x] Tests stub the global `fetch` and assert the requests sent, the results and the errors thrown.
- [x] The HTTP option and error types are exported from `./http` (moved from ticket 03).
- [x] No portal-specific logic: no branch headers, email gate, API-version retry or store reads.

## Notes (resolved 2026-11-11)

- API: `const http = createHttpClient({ baseUrls, getHeaders, beforeRequest, onError, notify, messages })`, then `await http<T>(endpoint, options)`. Base URLs can be functions, which covers portal's `%VERSION%` API-version placeholder.
- `onError(error, retry)`: return `retry()` to resend once with fresh headers. The retried request never calls `onError`, so retries can't loop. Return a value to resolve with it, return nothing to throw as usual, or throw to replace the error. That covers portal's 401 refresh, API-version retry and logout.
- Renamed options (no consumers yet): `isPublic` → `public`, `onSuccessMessage` → `successMessage`, `onErrorMessage` → `errorMessage`, `app` → `base` (any configured name). portal's internal `_retried` / `_apiVersionRetried` / `_skipAuthRefresh` flags are gone.
- Fixed vs portal, each with a test: a success toast after a JSON response without `responseType`, and after a 204 with only a `label`; validation message lists reach the toast as a string array, not an HTML `<ul>`; a 200 with an unparseable body throws `HttpError` instead of `SyntaxError` (found in review), and the success toast now waits until the body has parsed.
- Changed vs portal: per-request `headers` override `getHeaders()` (portal let the defaults win).
- Kept from portal: network errors throw `HttpError(0)` **without** a toast; `beforeRequest` refusals don't toast; the default `credentials` is `'omit'`.
