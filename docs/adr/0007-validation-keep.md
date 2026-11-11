# 0007. Keep the hand-written validation

Status: Accepted (2026-11-11)

## Context

portal-iq-vue validates forms with `defineSchema` / `validate` (`FormErrors<T>`, `_self` for container errors). It has no dependencies and no tests.

## Decision

Port it as-is into `./utils`, writing a spec first. `useField` reads its errors. A Standard Schema adapter waits until a consumer asks for one.

## Consequences

No validation dependency. Zod or valibot users would need that adapter later.
