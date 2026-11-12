# 0015. AppDateInput on @vuepic/vue-datepicker; the kit's buttons are AppButtons

Status: Accepted (2026-11-12). Amends ADR-0010 (no heavy UI libraries) and ADR-0011 / ADR-0012 (runtime dependency allow-list).

## Context

The owner asked for portal-iq-vue's date picker (`@vuepic/vue-datepicker`) instead of native date inputs, with detailed docs. They also asked that dialogs, toasts and the confirm dialog use the kit's own elements so everything matches, that built-in buttons (show password, copy, clear, close) can be restyled or replaced through slots, and that inputs get leading / trailing slots.

## Decision

- `AppDateInput` wraps `VueDatePicker` (v12, runtime dependency; it brings `date-fns`). The kit draws the field (label, a trigger button, leading / trailing, clear, hint, errors) with `ui` classes; the calendar is the picker's, themed with its `--dp-*` CSS variables. Apps import `@vuepic/vue-datepicker/dist/main.css`. Every other picker prop and slot passes through. Value shapes are the picker's (Date, `[start, end]`, `{ month, year }`, year number, week `[monday, sunday]`). `useDateInput` (native inputs) is removed; `toDate` / `formatDateValue` stay.
- `AppButton` takes `variant`; `createVueKit({ ui: { button: { [variant]: classes } } })` sets the looks. Every button the kit draws is an `AppButton`: confirm (`primary`, `danger` for error requests) and cancel (`secondary`), time-picker OK (`primary`), and `ghost` for show password, copy, clear, dialog close, toast buttons and chip remove. A component's own `ui` key is added on top (placement), the variant gives the look.
- `AppConfirmDialog`'s typed confirmation is an `AppInput`.
- Slots: `leading` / `trailing` (get `field`) on AppInput, AppSelect, AppDateInput, AppTimeInput; `password-toggle`, `copy`, `clear`, dialog `close` and toast `close` replace those buttons and get their function plus `props` to bind.
- `provideVueKit(kit)` gives one part of a page its own kit (e.g. a preview in another language) without touching the rest.
- Nuxt: every component renders on the server (tests/ui/ssr.spec.ts); `useToast` / `useConfirm` are no-ops there, so the module-level queue never mixes requests.

## Consequences

- One more runtime dependency, with its own CSS for the calendar popup. The field itself still ships no CSS.
- The calendar's look is controlled by `--dp-*` variables, not by `ui` keys.

## Amendment (2026-11-12): review fixes

- Toasts move into the topmost open kit dialog (everything outside a modal is inert and under its backdrop); the page behind an open dialog doesn't scroll.
- `AppForm` runs the `rules` of fields inside it (form context) and clears them in `resetValidation()`.
- `AppDateInput`: `aria-expanded`, arrow-key navigation, the calendar is placed in a holder outside the picker's trigger area (Enter on a day used to bubble up and reopen it), focus returns to the field after a pick (after key release for Enter). `VueKitLocale.dateLocale` (a date-fns locale, kept raw) sets the calendar language.
- New rule `accepted` (only `true` passes); `required` keeps treating `false` / `0` as answers.
- `createHttpClient`: `signal` (cancel, `reason: 'aborted'`, no toast) and `timeout` (`reason: 'timeout'`).
- `AppSelect` is generic over its option values; typing highlights the first match.
- Dev-only warning for fields without an accessible name.
