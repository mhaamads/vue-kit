# Spec: vue-kit v1.0

Status: ready-for-agent
Type: spec
Decisions: ADR-0001 to ADR-0010 (`docs/adr/`). Design: `docs/shared-package/03-input-design.md`. Inventory: `docs/shared-package/01-inventory.md`.

## Problem Statement

Moonline is about to build new Vue apps. The code they will need lives only inside portal-iq-vue: the HTTP client, form validation, dates and colours, buttons, dialogs, toasts and the whole form-input set. It is tangled with that app's Pinia stores, auto-imports, auth flow and DevExtreme, so a new app cannot reuse it without copying. Copying would also carry over bugs the audit found:

- server error text rendered as raw HTML in toasts
- success toasts that never show
- input attributes and listeners applied twice
- form errors that screen readers cannot hear

portal-iq-vue itself must not change (ADR-0001).

App developers also need to restyle and restructure inputs per app without losing validation, masking or accessibility. Today the only way is to fork the component.

## Solution

A private, compiled, versioned library, `@moonlinetravel/vue-kit`, in its own repo, published to GitHub Packages. A new app installs it, adds one plugin and two CSS lines, and gets:

- `./utils`: validation (`defineSchema` / `validate`), date, colour and image helpers, an event bus, and generic types.
- `./http`: a `fetch`-based client. Base URLs, headers, auth refresh and error handling are configured by the app instead of hard-wired to one app's stores.
- `./ui`: buttons, text, icons, dialogs, drawers, toasts, confirm dialogs, a form wrapper, and the full input set. Every input keeps all of its behaviour in a composable and can be replaced at four levels: attributes, part slots, a full-markup slot, or an app-wide component override.

The behaviour is ported from portal-iq-vue and proven by tests in vue-kit. The known bugs are fixed during the port. No heavy UI library comes along (ADR-0010).

## User Stories

### Installing and setting up

1. As an app developer, I want to install vue-kit from our private GitHub Packages registry with one `.npmrc` line, so that the code stays private to Moonline.
2. As an app developer, I want vue-kit to declare `vue` as a peer dependency, so that my app and the kit share one Vue instance.
3. As an app developer, I want vue-kit not to require Pinia, vue-router, DevExtreme, a date-picker or a rich-text editor, so that my app's bundle and licences stay mine to choose.
4. As an app developer, I want to register the kit with one `app.use(createVueKit(options))` call, so that setup is a single place.
5. As an app developer, I want every component to work with sensible defaults when I pass no plugin options, so that I can start without configuring anything.
6. As an app developer, I want to import only the area I need (`/utils`, `/http` or `/ui`), so that a page using a date helper does not load UI code.
7. As an app developer, I want typed exports with `.d.ts` files and autocompletion for every prop, slot prop and composable return value, so that I find the API from my editor.
8. As an app developer, I want an ESM build with `vue` externalised, so that my bundler tree-shakes what I don't use.
9. As an app developer, I want to import the kit's `theme.css` and add one `@source` line, so that Tailwind v4 generates exactly the classes the kit uses.
10. As an app developer, I want a README with install, setup and an example for every override level, so that I don't have to read the source.

### Theming, direction and text

11. As a designer, I want to change colours by overriding the kit's CSS tokens in my app's `@theme`, so that one app can look different without forking components.
12. As an app developer, I want dark mode to follow `[data-theme=dark]` through CSS, so that components never ask a store which theme is active.
13. As an end user reading a right-to-left language, I want icons, paddings, prefixes and suffixes mirrored when the app sets `dir: 'rtl'`, so that forms read naturally.
14. As an app developer, I want every built-in string (validation messages, aria labels such as "Show password", toast defaults, confirm button labels) to come from a `messages` option, so that I can translate the kit with any i18n setup or none.
15. As an app developer using vue-i18n, I want to pass my translated strings into `messages`, so that the kit doesn't force a second i18n library on me.

### Utils

16. As an app developer, I want `defineSchema` and `validate` to behave exactly as in portal-iq-vue, including nested objects, arrays and `_self` container errors, so that existing schema knowledge carries over.
17. As an app developer, I want validation messages to come from `messages`, so that errors appear in the user's language.
18. As an app developer, I want date helpers (formatting, local ISO strings, month shifting, calendar ranges, UTC midnight) without a date library, so that my bundle does not grow by a dependency.
19. As an app developer, I want one `formatDate` that covers both date-only and date-time formats, so that I stop writing local copies.
20. As an app developer, I want colour helpers (hex ↔ HSL, lighten, a colour readable on the current theme), so that user-picked colours stay legible in light and dark mode.
21. As an app developer, I want image helpers (normalise a URL, swap in a broken-image placeholder), so that broken images look the same everywhere.
22. As an app developer, I want a typed cross-component event bus (`broadcastEvent`, `useGlobalEvent`, `waitForEvent`) that unsubscribes on unmount, so that unrelated components can trigger refreshes without leaking listeners.
23. As an app developer, I want small generic helpers (deep clone, clipboard copy, ordinal suffix, time-string parsing and formatting, invert object), so that I don't reinvent them.
24. As an app developer, I want generic types (HTTP option and error shapes, form-error shapes, z-index scale, file-type helpers) exported, so that my code and the kit agree on shapes.

### HTTP

25. As an app developer, I want `createHttpClient(config)` to return a client I can call from components, stores or plain modules, so that HTTP does not depend on component setup.
26. As an app developer, I want to configure named base URLs and pick one per request, so that one client talks to several backends.
27. As an app developer, I want a `getHeaders()` hook that runs before every request, so that my app adds its token and branch headers without the kit knowing about my auth store.
28. As an app developer, I want a `beforeRequest` hook that can refuse a request with an `HttpError`, so that I can block calls until a precondition holds (e.g. "email required").
29. As an app developer, I want an `onError` hook that can retry the request once, so that I can refresh an expired token on 401, or refresh an API version, and transparently resend.
30. As an app developer, I want every failure, including network errors (status 0), thrown as an `HttpError` with `status` and parsed `data`, so that callers handle one error type.
31. As an app developer, I want JSON, blob, text and form-data bodies and responses, plus empty (204) responses returned as an empty object, so that every endpoint shape is covered.
32. As an app developer, I want query params with empty values left out, so that URLs stay clean.
33. As an app developer, I want error toasts shown by default and suppressible per request (always, or for given status codes), so that expected failures don't alarm users.
34. As an app developer, I want `showSuccessToast` to show a success toast whenever the request succeeds, whether or not I set `responseType`, so that users see confirmation after saving (fixes the portal bug).
35. As an app developer, I want backend validation errors turned into a readable message (first field error, the message, or a list of messages), so that users see what went wrong.
36. As an end user, I want server error text shown as text, never run as HTML, so that a malicious value echoed by the backend cannot execute script in my browser (fixes the portal XSS).

### Feedback: toasts and confirm

37. As an app developer, I want `useToast({ type, message, duration, action, actionLabel, persistent })` callable from anywhere, so that HTTP errors and components share one toast queue.
38. As an app developer, I want to mount `<AppToasts>` and `<AppConfirmDialog>` once at the app root, so that overlays render in one place.
39. As an app developer, I want `useConfirm(message, options)` to return a promise of `true` / `false`, so that I can `await` a confirmation inline.
40. As an app developer, I want a confirm option that requires typing a confirmation text, so that destructive actions need deliberate intent.
41. As an end user, I want toasts announced by screen readers and dismissible by keyboard, so that I don't miss or get stuck on them.
42. As an app developer, I want toast and confirm labels to come from `messages`, so that they are translated.

### Primitives

43. As an app developer, I want `<AppButton>` with variants, sizes, an icon, a loading state and a `to` prop that renders the app's `RouterLink` when one is registered, so that buttons and links look the same without the kit depending on vue-router.
44. As an app developer, I want `<AppText>` with the size, weight and colour scale, so that typography stays consistent.
45. As an app developer, I want `<AppIcon>` backed by the Iconsax set, so that icons match the existing design.
46. As an app developer, I want `<AppDialog>` and `<AppDrawer>` teleported to the body with a heading part, close on Escape and backdrop, and focus kept inside while open, so that overlays are accessible and stack correctly.

### Inputs: behaviour (all inputs)

47. As an app developer, I want every input to take `v-model`, `label`, `hint`, `errors`, `required`, `disabled` and `readonly`, so that all inputs feel the same.
48. As an app developer, I want `id` to be optional and generated with `useId()`, so that I don't invent ids, and labels and errors still link correctly.
49. As a screen-reader user, I want each input's label linked to it, so that I hear what the field is.
50. As a screen-reader user, I want an invalid field marked `aria-invalid="true"` and its error linked through `aria-describedby`, so that I hear the error when I reach the field.
51. As a screen-reader user, I want errors that appear on submit announced (`role="alert"`), so that I learn the form failed.
52. As an end user, I want empty required fields not marked invalid before I first submit, so that the form doesn't shout at me while I'm still filling it in.
53. As an app developer, I want each field to expose `touched` and `dirty`, plus a `reset()`, so that I can build "unsaved changes" warnings.
54. As an app developer, I want `<AppForm :form-data :schema @submit>` to validate on submit, give errors to my fields through its slot, and focus the first invalid control, so that submit handling is one component.
55. As an app developer, I want a `devBypassValidation` hook on the plugin, so that my own dev tools can skip validation without the kit knowing about them.

### Inputs: per type

56. As an app developer, I want `<AppInput>` for text, email, password, tel, number and textarea (`as="textarea"`), so that one component covers free-text fields.
57. As an app developer, I want masks, accept-only filters (numbers / letters / alphanumeric) and capitalisation (first / each word), applied on input and on focus as in portal-iq-vue, so that formatted fields keep working.
58. As an app developer, I want `type="number"` to give me a number in `v-model`, so that I don't parse strings.
59. As an end user, I want a show / hide password button that screen readers can operate, so that I can check what I typed.
60. As an end user, I want a phone input with a country-code picker, so that I enter international numbers correctly.
61. As an end user, I want a copy button on read-only values when enabled, so that I can copy codes quickly.
62. As an end user, I want textareas to grow with their content, so that I see everything I typed.
63. As an app developer, I want `<AppSelect>` with single and multiple selection, search (`v-model:query`), lazy options, a selected-count limit, unselectable options, option descriptions and custom option / trigger / empty slots, so that every select in portal-iq-vue can be rebuilt with it.
64. As a keyboard user, I want to open, move through, pick and close select options with the arrow keys, Home, End, Enter and Escape, so that I never need a mouse.
65. As a screen-reader user, I want the select to expose combobox / listbox / option roles, the expanded state and the active option, so that I know where I am.
66. As an end user, I want long option lists to scroll smoothly, so that selects with thousands of options stay fast.
67. As an app developer, I want `<AppCheckbox>`, `<AppCheckboxGroup>`, `<AppRadioGroup>` and `<AppSwitch>` on native inputs, so that keyboard and form behaviour come from the browser.
68. As an app developer, I want radio groups with horizontal or vertical layout, optional "select first option" and optional "allow removing the selection", so that existing radio behaviour carries over.
69. As an app developer, I want `<AppSwitch>` with custom true / false values and an optional two-label style, so that toggles can carry any value.
70. As an app developer, I want `<AppDateInput>` on native date, date-time, month and week inputs, with ranges, min / max and clearing, so that dates work without a picker library.
71. As an app developer, I want the date input to reject dates outside an allowed or disallowed list and report it through `errors`, so that those rules still hold without a custom picker.
72. As an app developer, I want `<AppTimeInput>` with 12 / 24-hour format, minute step, min / max time, presets and clearing, giving `{ hours, minutes }`, so that time entry matches portal-iq-vue.

### Inputs: overriding

73. As an app developer, I want `class`, `style`, native attributes and listeners to land once, on the real control, so that `maxlength`, `autocomplete` and `@keydown.enter` just work (and `@keydown.enter` fires once, which fixes the portal bug).
74. As an app developer, I want a `root-class` prop for the wrapper, so that I can size the field in a layout.
75. As an app developer, I want part slots (`label`, `prefix`, `suffix`, `hint`, `error`) with the props each part needs, so that I can change one part and keep the rest.
76. As an app developer, I want a default scoped slot that gives me the whole field API (`inputProps`, `labelProps`, `errorProps`, value, actions), so that I can write completely custom markup and keep all behaviour and accessibility.
77. As an app developer, I want to register my own components app-wide (`components: { Input: MyInput, … }`), so that every `<AppInput>` in my app uses my design.
78. As an app developer writing an override, I want to receive one typed `field` prop, so that my component only binds and never re-implements behaviour.
79. As an app developer, I want each input's composable (`useTextInput`, `useSelect`, …) and default skin exported, so that I can build new inputs or reuse the default look inside my override.
80. As an app developer, I want overrides to bring their own date picker if they need picker-only features, so that the kit stays free of picker libraries while I keep that option.

### Maintaining and releasing

81. As a vue-kit maintainer, I want lint to block imports of portal-iq-vue paths, app stores and packages outside the allowed dependency list, so that the kit stays generic.
82. As a vue-kit maintainer, I want one contract test suite per input run against the default UI, a slot override and a plugin override, so that behaviour leaking into templates fails CI.
83. As a vue-kit maintainer, I want a pack-and-consume smoke test, so that a broken exports map, missing types or a missing `theme.css` fails before release.
84. As a vue-kit maintainer, I want type-check, lint, tests and build to run on every push, so that `main` is always releasable.
85. As a vue-kit maintainer, I want pushing a version tag to publish to GitHub Packages, so that releasing is `npm version`, a CHANGELOG entry and a push.
86. As a vue-kit maintainer, I want `0.x` versions while porting and `1.0.0` when this spec is done, and breaking changes only in majors after a deprecation warning, so that consumers can upgrade safely.
87. As a vue-kit maintainer, I want every ported module checked against portal-iq-vue's behaviour by tests, so that "ported" means "same behaviour" and not "similar code".

## Implementation Decisions

**Repository and package**
- `MoonlineTravel/vue-kit`, private. npm name `@moonlinetravel/vue-kit`, published to `npm.pkg.github.com` (ADR-0003, ADR-0004).
- Subpath exports `./utils`, `./http`, `./ui` and `./theme.css`. No root barrel that re-exports everything. Inside the package, modules import each other directly, not through barrels.
- Vite library mode, ESM only, preserving modules for tree-shaking. Types from `vue-tsc` declaration emit. `vue` is externalised and declared as a `peerDependency`.
- Runtime dependencies are exactly the allow-list: `maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`. Plus `@iconify/vue`, `@vueuse/core` and `vue-virtual-scroller`, approved for ADR-0011. No Pinia, no vue-router, no DevExtreme, date-picker, Tiptap, colour picker or lightbox (ADR-0010).
- No auto-imports: every file imports Vue APIs explicitly.
- Toolchain mirrors portal-iq-vue: TypeScript, Vue 3.5 `<script setup>` only, Tailwind v4, ESLint flat config plus Prettier, Vitest. Its ESLint component rules carry over: type-based `defineProps`, PascalCase component names, kebab-case events and slots, scoped styles.

**Plugin and configuration**
- `createVueKit(options)` returns a Vue plugin. Options: `dir`, `messages` (partial; merged over English defaults), `components` (global overrides keyed `Input`, `Select`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `DateInput`, `TimeInput`), and `devBypassValidation`.
- Config travels through `app.provide` with typed injection keys. Every injection has a default, so components work without the plugin.

**`./http` module**
- `createHttpClient(config)` returns a request function plus `HttpError`. The client is a plain object, so it works outside component setup.
- Config: named `baseUrls` with a default; `getHeaders()` (sync or async); `beforeRequest(endpoint, options)` that may throw; `onError(error, retry)`, which may call `retry()` once and return its result; and a `notify` hook that defaults to the kit's toast queue.
- Per-request options keep portal-iq-vue's: method, body, params, form type, response type, credentials, public flag (skips `getHeaders` auth), hide-error-toast (boolean or status list), show-success-toast with message or label, empty-response flag, and a base-URL override.
- portal-iq-vue's auth refresh, logout, branch headers, email-required gate and API-version retry are **not** in the kit. A consumer rebuilds them with `getHeaders`, `beforeRequest` and `onError`.
- Bug fixes during the port: a success toast shows whenever `showSuccessToast` is set and the request succeeds, whatever the `responseType`. Error messages travel as plain text, never HTML. A list of messages is a string array, rendered as a list by the toast component.

**Toasts and confirm**
- The queue and the confirm state are module-level reactive state in the kit, not Pinia. That way `useToast()` works from the HTTP client and plain modules.
- The toast `message` is `string | string[]` and is rendered as text. portal-iq-vue's `to` (route) option is dropped; use `action`.
- `<AppToasts>` is a polite live region with dismiss buttons. `<AppConfirmDialog>` is a modal dialog with focus kept inside, Escape to cancel, and an optional typed-confirmation text.

**Primitives**
- `<AppButton>` resolves `RouterLink` at runtime when `to` is set and the app has registered it. Otherwise it renders an `<a>`. There is no vue-router import.
- `<AppText>` is text only. portal-iq-vue's HTML mode is dropped because it needs an HTML sanitiser outside the allow-list.
- `<AppIcon>` wraps `vue-iconsax`. Icon-name types ship with it.
- `<AppDialog>` / `<AppDrawer>` / `<AppOverlayHeading>` port the overlays: teleport to body, Escape, backdrop click, focus kept inside, `role="dialog"` with `aria-modal` and `aria-labelledby` the heading.

**Inputs** (full API in the design doc)
- Layered: `useField` → per-type composable → default skin component. Templates hold no logic.
- `useField(options)` takes the component's `defineModel` ref plus `id`, `errors`, `required`, `disabled`, `readonly` and `hasHint` as refs, getters or values. It returns a plain object of refs: `id`, `value`, `setValue`, `errors`, `error`, `invalid`, `touched`, `dirty`, `reset`, `labelProps`, `hintProps`, `errorProps`, `controlAria` and `onBlur`. Id scheme: `<id>`, `<id>-label`, `<id>-hint`, `<id>-error`.
- Per-type composables add their own state and prop getters: `useTextInput` (`inputProps`, `toggleProps`, `displayValue`, `code`), `useSelect` (`triggerProps`, `listboxProps`, `optionProps(o, i)`, `open`, `query`, `filteredOptions`, `select` / `remove` / `isSelected`, `activeIndex`), `useChoice`, `useChoiceGroup` (`groupProps`, `itemProps(o)`), `useDateInput` (`inputProps` or `startProps` / `endProps`, `mode`, `range`), and `useTimeInput`.
- Prop renames versus portal-iq-vue: `tag` → `as`, `hasCopy` → `copyable`. `classList` / `labelClassList` are removed in favour of `class`, `root-class` and the `label` slot. There are no aliases, because vue-kit has no consumers yet.
- `defineOptions({ inheritAttrs: false })` on every input. Attributes and listeners bind once, on the control.
- Override levels: attributes; part slots (`label`, `prefix`, `suffix`, `hint`, `error`); a default slot that receives the whole API; and a global component override that receives one `field` prop and the passed-through slots. The default component always runs the composable itself, so an override can only bind.
- `<AppForm>` keeps portal-iq-vue's API (`formData`, `schema`, `submit`, slot `{ errors }`, exposed `validate`). It focuses the first `[aria-invalid="true"]` control after a failed submit.
- The text model holds the masked string, as in portal-iq-vue. The select's floating position stays on `@floating-ui/vue`. The date input is native only; the picker-only features listed in the design doc are dropped.

**Port order** (one module per ticket, each green before the next): repo scaffold and CI → `./utils` (validation spec first) → `./http` → toasts / confirm → primitives → `useField` + `<AppInput>` + the contract harness → remaining inputs → `<AppForm>` → pack smoke test and first publish of `0.1.0`.

## Testing Decisions

**What makes a good test here:**
- Tests import only from the public entry points (`@moonlinetravel/vue-kit/utils`, `/http`, `/ui`), never internal files. They assert what a consumer can observe: return values, thrown `HttpError`s, requests sent, DOM, ARIA attributes, emitted `v-model` updates and focus.
- No assertions on internal refs, private helpers, class names or call counts of internals.
- One seam (the public API) and two observation points: the stubbed global `fetch` for `./http`, and the rendered DOM through the installed plugin for `./ui`.
- Ported behaviour is pinned by a test that states the portal-iq-vue behaviour it reproduces. For example: masks, accept-only filters and capitalisation give the same output as portal-iq-vue's input.

**Modules and what is tested:**
- **`./utils` validation:** nested objects, arrays, `_self` errors, every rule type, messages from config. Written before the port, since portal-iq-vue has no tests for it.
- **`./utils` dates, colours, images, event bus, helpers:** pure input → output, plus event-bus cleanup on unmount. portal-iq-vue's existing date and image specs are prior art.
- **`./http`:** URL and params building; headers from `getHeaders`; the public flag; every body and response type; 204; network error → status 0; `beforeRequest` refusal; `onError` retry once and no infinite retry; error-toast suppression; success toast with and without `responseType` (regression); error text arriving as text, not HTML (regression).
- **Toasts / confirm:** queue order, duration, dismiss, action; confirm resolves true or false; typed confirmation; text rendering of HTML-looking messages (regression); live-region and dialog ARIA.
- **Primitives:** button as button / link / `RouterLink`, loading and disabled; dialog and drawer Escape, backdrop, focus kept inside, ARIA.
- **Inputs, as a contract suite:** each input's suite runs with `describe.each` over three harnesses: the default UI, a minimal slot override (bare label / control / error bound from the slot props), and a plugin override (a minimal component registered through `createVueKit`). Cases cover `v-model` both ways, per-type behaviour, label and id linking, `aria-invalid` / `aria-describedby`, `role="alert"`, disabled / readonly / required, attributes on the control only, `@keydown.enter` firing once (regression), messages from config, and RTL rendering with `dir: 'rtl'`. A case that passes on one harness and fails on another means behaviour leaked into a template.
- **`<AppForm>`:** submit with errors gives errors to the fields and focuses the first invalid control; submit without errors emits `submit`; the dev bypass skips validation.
- **Dependency guard:** one test fails if any file under the UI source imports a package outside the allow-list.
- **Packaging smoke test:** build, `npm pack`, install the tarball into a minimal Vite + Tailwind v4 fixture app, run `vue-tsc` on it, and mount an `<AppInput>` from the installed package. This proves the exports map, the `.d.ts` files, `theme.css` and the peer externals.

**Tooling:** Vitest with `@vitejs/plugin-vue`, `happy-dom` and `@vue/test-utils` as dev dependencies. Prior art: portal-iq-vue's spec files (`date-utils`, `image-utils`, `last-filter-utils`, `useTableState`, `table-state-store`) show the plain Vitest style. They are reference only, never imported.

## Out of Scope

- Any change to portal-iq-vue, including adopting vue-kit there (ADR-0001, ADR-0002).
- DataGrid, the custom filter, sorting and last-filter pipeline, DevExtreme charts, Tiptap rich text, colour picker, lightbox and image preview (ADR-0010).
- v1.x items: badges, tabs, breadcrumbs, info blocks and page headings; floating box, dropdowns and action menus; tooltip and draggable directives; image and file upload; recurrence and schedule; the permission directive; virtual and infinite scroll containers; colour input on native `<input type="color">`.
- App-specific code from portal-iq-vue: auth / MSAL, socket, env config, its stores, domain models and types, permission keys, the legacy-portal message bridge, and the DevExtreme licence patch.
- Picker-only date features: inline calendar, quarter and year pickers, multi-dates, multiple calendars, time zones, and dates greyed out inside the popup.
- An unmasked model value for masked inputs, input debounce, a Standard Schema adapter, a form error summary, and SSR.
- Creating the GitHub repo, the GitHub Packages publish permissions and the release secrets. Each needs a separate go-ahead (ADR-0004).

## Further Notes

- **Dependency allow-list: approved 2026-11-11** (add `@iconify/vue`, `@vueuse/core`, `vue-virtual-scroller`; recorded as ADR-0011 in ticket 01). Original note: ADR-0010 lists `maska`, `@floating-ui/vue`, `tailwind-merge` and `vue-iconsax`. But the v1 primitives in portal-iq-vue also use `@iconify/vue` (button, select, checkbox icons), `@vueuse/core` (select) and `vue-virtual-scroller` (long option lists). All three are small utilities, which ADR-0010's rule ("heavy UI libraries out, small utilities stay") allows. This spec assumes they join the allow-list, recorded as ADR-0011 in the scaffold ticket. `vue-router` is avoided by resolving `RouterLink` at runtime. If the owner prefers a shorter list: replace the Iconify icons with Iconsax equivalents, drop `@vueuse/core` for the few lines it provides, and drop virtual scrolling (long lists render in full).
- The audit's security findings in portal-iq-vue (an HR API token in the public bundle, and `v-html` toasts) are not tracked here. vue-kit only avoids repeating them (stories 34 and 36).
- The design doc, `docs/shared-package/03-input-design.md`, holds the full prop, slot and return-type tables and the override examples. Keep it in sync if a ticket changes an API.
- Domain vocabulary: no `GLOSSARY.md` exists yet. The terms used here (field, skin, override level, contract suite, allow-list) are good candidates once `/grill-with-docs` or `/domain-modeling` runs in this repo.
