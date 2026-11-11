# 0008. RTL-ready; overridable text; no i18n library

Status: Accepted (2026-11-11)

## Context

portal-iq-vue has no i18n. Its strings are hard-coded English. About 92% of the CSS direction classes in its shared UI are already logical (`ps-`, `end-`).

## Decision

Components use logical CSS classes only, enforced by lint. Plugin options take `dir` and `messages`. Every built-in string (validation messages, aria labels, toast defaults) is read from `messages`.

## Consequences

No vue-i18n dependency. An app that uses vue-i18n passes in its translated strings.
