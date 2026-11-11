# 02: Validation

**What to build:** An app developer defines a schema with `defineSchema` and gets the same `FormErrors<T>` from `validate` as in portal-iq-vue: nested objects, arrays, `_self` container errors and every rule type. The error texts come from passed-in messages, so they can be translated.

**Blocked by:** 01 (Scaffold tracer).

**Status:** resolved

- [x] The tests are written **before** the port. They pin portal-iq-vue's current behaviour for every rule type, nested objects, arrays (length rules plus per-item errors) and `_self`.
- [x] `defineSchema`, `validate`, `isEmpty`, the default messages and the validation types are exported from `./utils`. **Not done: the phone validator.** portal-iq-vue's `isPhone` needs `libphonenumber-js`, which is outside the ADR-0011 allow-list. Apps add phone checks through the `custom` rule (recipe in ticket 15's README).
- [x] Every message comes from a messages object merged over English defaults. A test overrides one message and sees it in the result.
- [x] Each case is labelled with the portal-iq-vue behaviour it reproduces.
- [x] The smoke fixture validates a small schema through the installed package.
