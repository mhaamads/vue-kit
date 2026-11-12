# 0008. RTL-ready; overridable text; no i18n library

Status: Accepted (2026-11-11)

## Context

portal-iq-vue has no i18n. Its strings are hard-coded English. About 92% of the CSS direction classes in its shared UI are already logical (`ps-`, `end-`).

## Decision

Components use logical CSS classes only, enforced by lint. Plugin options take `dir` and `messages`. Every built-in string (validation messages, aria labels, toast defaults) is read from `messages`.

## Consequences

No vue-i18n dependency. An app that uses vue-i18n passes in its translated strings.

## Amendment (2026-11-12): runtime locales

`dir` and `messages` were static options, but apps let users change language while the app runs. They are replaced by `createVueKit({ locale, locales: { name: { dir, messages } }, syncDocument })`, with `setLocale` / `addLocale` on the kit and on `useVueKit()`.

- English is built in; missing keys in a locale fall back to English.
- Direction belongs to the locale; by default the kit writes `lang` and `dir` on `<html>`.
- `messages` stays one reactive object updated in place, so components keep reading `messages.x`.
- `AppForm` re-checks visible errors on a switch; `createHttpClient({ messages })` also takes a function read per request.
- Still no i18n library. A vue-i18n app watches its locale and calls `kit.setLocale` (Storybook: Guides → Languages).
