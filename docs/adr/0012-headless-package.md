# 0012. Headless package: behaviour only, UI lives in the docs

Status: Accepted (2026-11-12), amended by ADR-0014 (a `ui` class map replaces the slot / override hooks listed below). Supersedes ADR-0006. Amends ADR-0011 and the "default skin" parts of `docs/shared-package/03-input-design.md`.

## Context

The first version of `./ui` shipped portal-iq-vue's look: Tailwind classes in every component, a `theme.css` with portal's tokens, Iconsax icons, and `tailwind-merge`. After reviewing it in Storybook, the owner clarified that the package must not carry any UI. Apps must be completely free in how things look; vue-kit is about functionality. The styled look belongs in the documentation, as an example that apps copy and adapt.

## Decision

- vue-kit is **headless**. Components work out of the box but render plain, accessible HTML with **no classes and no styles**. The only exceptions are inline styles that are behaviour, such as floating-ui positioning and the select's long-list windowing.
- Styling hooks on the rendered elements: the caller's `class` / attrs on the control, `data-*` state attributes (`data-invalid`, `data-disabled`, `data-readonly`, `data-required`, `data-open`, `data-state`, `data-active`, `data-selected`, `data-type`, `data-position`), part slots, the full-markup default slot, and app-wide component overrides (`createVueKit({ components })`).
- Removed from the package: `theme.css`, `AppText`, `AppIcon` (and `vue-iconsax`), `tailwind-merge`, the button / text class maps and `ZIndex`, and every visual prop (`variant`, `size`, `radius`, `aspect`, `icon*`, `rounded`, `onLabel` / `offLabel`, …). Visible texts that used to be icons (show password, copy, clear, close) are text from `messages`.
- The **example skin** lives in Storybook (`stories/skin/`): portal's look rebuilt on the public override API with Tailwind and its own `theme.css`. It shows how an app builds its skin, including presentation props such as `radius` (presets plus any custom CSS length). Apps copy what they need.
- Runtime dependency allow-list (replaces ADR-0011's): `vue` (peer), `maska`, `@floating-ui/vue`, `@vueuse/core`.

## Consequences

- An app that installs vue-kit and uses `<AppInput>` gets a working, accessible but plain input until it styles it. Every app writes, or copies from the docs, a skin once.
- Tailwind is no longer a requirement for consumers (it was in ADR-0006).
- The tests stop asserting classes. They assert behaviour, ARIA and `data-*` hooks instead.
- The docs carry the design system, so they must stay runnable: the Storybook build is part of the checks.
