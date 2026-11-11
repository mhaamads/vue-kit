# 0002. Consumers are new apps; vue-kit is compiled and published

Status: Accepted (2026-11-11)

## Context

With portal-iq-vue out (ADR-0001), every consumer is a future app in another repo.

## Decision

vue-kit is a compiled library: Vite library mode, ESM output, `.d.ts` from `vue-tsc --declaration --emitDeclarationOnly`, and `vue` (plus any heavy peers) externalised as `peerDependencies`.

## Consequences

A build and a release step are needed from day one. The internal-source-package pattern (`packages/kanban-dnd` in portal-iq-vue) does not apply.
