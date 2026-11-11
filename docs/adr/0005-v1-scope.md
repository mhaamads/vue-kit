# 0005. v1.0 scope is core + inputs

Status: Accepted (2026-11-11)

## Context

The inventory has about 39 candidate rows. DataGrid brings a DevExtreme version pin and a license patch.

## Decision

v1.0 contains: `./utils` (inventory rows 8, 10, 12: validation, dates, colors, image, events, generic types), `./http` (row 14, with auth injected), and `./ui`, made of the input system (rows 2, 3, 7, redesigned in `docs/shared-package/03-input-design.md`) plus the primitives it needs (rows 1, 4, 6). Rows 5, 9, 13, 16, 18, 19 and 21 come in v1.x. Rows 20, 22 and 31–37 are app-specific and never go in. ADR-0010 removes rows 15 and 17.

## Consequences

The smallest kit a new app can use for forms and API calls.
