# 0001. vue-kit lives in its own repo; portal-iq-vue is untouched

Status: Accepted (2026-11-11)

## Context

Shared Vue code was found in portal-iq-vue (see `docs/shared-package/01-inventory.md`). The owner requires that portal-iq-vue is not affected by this work at all.

## Decision

The package lives in `MoonlineTravel/vue-kit`. portal-iq-vue is read-only reference code. Nothing in portal-iq-vue is edited, and it does not depend on vue-kit.

## Consequences

Code is ported into vue-kit, not moved, so the two copies can drift. Porting tickets must reproduce portal-iq-vue's behaviour and prove it with tests in vue-kit.
