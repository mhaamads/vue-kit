# 0003. One package with subpath exports

Status: Accepted (2026-11-11)

## Context

There were three options: one package, a core + ui split, or a three-way split. GitHub Packages requires the npm scope to equal the GitHub owner.

## Decision

One package, `@mhaamads/vue-kit`, with subpath exports `./utils`, `./http` and `./ui`. The `./data-grid` subpath in the original decision is withdrawn by ADR-0010.

## Consequences

One version and one release. A page that only needs `./utils` never loads UI code. Splitting later is a major version.
