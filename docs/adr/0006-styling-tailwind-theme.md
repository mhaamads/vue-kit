# 0006. Styling: Tailwind v4 classes plus a shipped theme.css

Status: Superseded by ADR-0012 (2026-11-12). Was accepted 2026-11-11.

## Context

portal-iq-vue styles components with Tailwind v4 utilities and 44 `--color-*` tokens in `@theme`. Dark mode keys off `[data-theme=dark]`.

## Decision

Components keep Tailwind classes. vue-kit ships `theme.css`, which holds the tokens and the `dark` custom variant. Consumers use Tailwind v4: they `@import` `theme.css`, add `@source` pointing at the package's `dist`, and override tokens in their own `@theme`.

## Consequences

No duplicate utility CSS or preflight. Consumers must use Tailwind v4. Theming means overriding tokens.
