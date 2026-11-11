# 02: Validation

**What to build:** An app developer defines a schema with `defineSchema` and gets the same `FormErrors<T>` from `validate` as in portal-iq-vue: nested objects, arrays, `_self` container errors and every rule type. The error texts come from passed-in messages, so they can be translated.

**Blocked by:** 01 (Scaffold tracer).

**Status:** ready-for-agent

- [ ] The tests are written **before** the port. They pin portal-iq-vue's current behaviour for every rule type, nested objects, arrays (length rules plus per-item errors) and `_self`.
- [ ] `defineSchema`, `validate`, the built-in validators (including phone) and the validation types are exported from `./utils`.
- [ ] Every message comes from a messages object merged over English defaults. A test overrides one message and sees it in the result.
- [ ] Each case is labelled with the portal-iq-vue behaviour it reproduces.
- [ ] The smoke fixture validates a small schema through the installed package.
