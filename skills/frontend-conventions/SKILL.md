---
name: frontend-conventions
description: Vue 3 + TypeScript frontend conventions (naming, components, composables, API layer, forms, Pinia, Tailwind styling, RTL-safe classes, folder structure) and how to use the @mhaamads/vue-kit package. Use for any frontend work - starting a new project, building or changing components, pages, features, composables, stores, forms or API calls, refactors, and code reviews.
---

# Frontend Conventions

Single-page Vue 3 apps. Every rule here was agreed with the owner; follow it over your defaults.

- New project or new top-level folder → read [references/folder-structure.md](references/folder-structure.md) first.
- Project has `src/apps/<app>/` (super app) → read [references/super-app-variant.md](references/super-app-variant.md); the project's `CLAUDE.md` wins over this file.
- Writing a component, composable, API file, or form from scratch → copy the shape in [references/examples.md](references/examples.md).

## Stack

Vue 3.5+ `<script setup lang="ts">` · TypeScript 5.9+ · Vite 7 · vue-router 4 · Pinia 3 (setup stores) · Tailwind v4 · VueUse · `unplugin-auto-import` · Vitest · ESLint 9 flat (`eslint-plugin-vue`, `@vue/eslint-config-typescript`) · Prettier.

### Shared kit: `@mhaamads/vue-kit` (only when the project uses it)

Check `package.json`. **No `@mhaamads/vue-kit` there** → use the project's own components, form and HTTP helper, with every other rule in this file; never add the kit. **The kit is there** → forms, inputs, dialogs, toasts, validation and the HTTP client come from it. Import them; never copy or rewrite them. Docs with every option: https://mhaamads.github.io/vue-kit/

| Import from | What |
|---|---|
| `@mhaamads/vue-kit/ui` | `createVueKit`, `AppForm`, `AppInput`, `AppSelect`, `AppCheckbox`, `AppSwitch`, `AppRadioGroup`, `AppCheckboxGroup`, `AppDateInput`, `AppTimeInput`, `AppPinInput`, `AppButton`, `AppDialog`, `AppToasts`, `AppConfirmDialog`, `useToast`, `useConfirm` |
| `@mhaamads/vue-kit/http` | `createHttpClient`, `HttpError` |
| `@mhaamads/vue-kit/utils` | `defineSchema`, `validate`, `FormErrors`, date, colour, file and event helpers |

- The kit ships **no CSS**. Its look is one class map: `createVueKit({ ui })` in `src/plugins/vue-kit.ts`, written with the app's semantic classes. Restyle a kit component there (app-wide) or through its `ui` prop (one place); never with wrapper components or deep selectors.
- Labels, hints, errors and built-in buttons have slots; use a slot before building a new input.
- A truly new input → build it on the kit's composables (`useField`, `useTextInput`, `useSelect`, `useChoice`, `useTimeInput`) so labels, errors, ARIA and `AppForm` work the same.
- Pieces the kit doesn't have (`Badge`, `Tabs`, `NoDataFound`, `DetailsBlock`, …) live in `components/ui/` and `components/blocks/`. Never fork a kit component into the app.

#### Dialogs, drawers, confirms and toasts (kit)

- Every dialog and drawer is built on `AppDialog`: `v-model` opens it, `title` names it, actions go in `#footer`. `position="start"` / `"end"` makes it a drawer. Name the file for its job: `ReasonDialog.vue`, `FiltersDrawer.vue`.
- Destructive actions ask first: `if (await useConfirm({ type: 'error', title, message, confirmLabel: 'Delete' }))`. Add `confirmText: 'delete'` when the user must type it.
- Feedback: `useToast({ type: 'success' | 'error' | 'info' | 'warning', message })`. After an API call, prefer `showSuccessToast: true` on the request.
- `<AppToasts />` and `<AppConfirmDialog />` are mounted once in `App.vue`; never per page.

## Naming Conventions

### Files and folders

| Kind | Pattern | Example |
|---|---|---|
| Folders | kebab-case | `components/pages/customers/` |
| Components | PascalCase `.vue`, name = file | `ContactCard.vue` |
| Component role suffix | `Card`, `Dialog`, `Drawer`, `Skeleton`, `Block`, `Form`, `GridView`, `Button`, `Select`, `Input` | `AddressFormBlock.vue` |
| Pages | `index.vue` (list), `view.vue`, `create.vue`, `edit.vue`; folders mirror the URL, plural resources | `pages/customers/contacts/create.vue` |
| Composables | `useX.ts` | `composables/useOrderForm.ts` |
| API | `<resource>.api.ts` | `api/contacts.api.ts` |
| Types | `x.model.ts`, `x.request.ts`, `x.response.ts`, `x.types.ts` (singular) | `types/api/auth/login.response.ts` |
| Schemas | `x.schema.ts` | `schemas/customer.schema.ts` |
| Constants | `x.constants.ts` | `constants/order.constants.ts` |
| Stores | `x.store.ts` → `useXStore`, id kebab | `stores/auth.store.ts` |
| Tests | `x.spec.ts` beside `x.ts` | `utils/date.spec.ts` |

A file never sits beside a same-named folder: use `order-history/index.vue`. File names skip their folder's words: `contacts/create.vue`.

### Identifiers

| Thing | Rule | Example |
|---|---|---|
| Types | PascalCase, `type` only, no `Type` suffix | `Customer` |
| API types | `XRequest` / `XResponse` | `LoginResponse` |
| Form state | `XFormData` | `CustomerFormData` |
| Constants | UPPER_SNAKE, option arrays included | `GENDER_OPTIONS`, `COUNTRY_CODE_TO_NAME` |
| Schemas | `xSchema`; conditional → `createXSchema(options)` | `customerSchema` |
| Booleans | `is` / `has` / `can` / `show` | `isCompany`, `showDiscount` |
| Loading flags | `isLoading` (main), `isSubmitting`, `isFetchingX`, `isDeleting` | |
| Event handlers | `handleX`, named for the event | `handleDeleteClick` |
| Actions | verb + noun | `deleteContact` |
| Data functions | `fetchX` = API read; `loadX` = orchestrates several fetches | `fetchCustomer`, `loadPage` |
| API objects | `xApi` with `list` / `get` / `create` / `update` / `remove` + custom verbs | `contactsApi.remove()` |
| Composables | `useX` only when it uses reactivity, lifecycle, or `inject`; otherwise a verb-named util | `getReviewRoute()` |
| Template refs | `useTemplateRef<T>('xRef')` | `tableRef` |
| Routes | `ROUTE.SCREAMING_KEY`, `NAME` kebab-case | `ROUTE.CUSTOMER_VIEW.NAME` |
| Events, slots, template props | kebab-case | `@set-filter`, `#after-heading` |

## Coding Conventions

### Formatting

Prettier decides: no semicolons, single quotes, 100 columns. Run `npm run format`; never hand-format.

### Functions

Arrow functions everywhere: `export const useX = () => {}`, `export const getX = () => {}`. At most 2 positional params: the required subject, then one options object. One signature per function.

```ts
export const useOrderForm = (customerId: string, { autoFillAddress = false } = {}) => { … }
```

### SFC anatomy

Block order `<template>` → `<script setup lang="ts">` → `<style scoped>` (only when Tailwind can't, max 60 lines).

```vue
<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'

const { contact, isEditable = false } = defineProps<{ contact: Contact; isEditable?: boolean }>()
const emit = defineEmits<{ 'role-updated': [role: ContactRole] }>()
const isOpen = defineModel<boolean>({ default: false })

watch(() => contact.id, fetchNotes) // destructured prop → wrap in a getter
</script>
```

- Props: type-based, destructured, inline defaults. `const props` only to pass many props through.
- Emits: always the typed tuple form. Two-way state → `defineModel`, not hand-written `update:x`.
- Page route params arrive as props (`props: true`). Query strings come from `useRoute().query` inside a `computed`.

### Templates

Templates stay readable:

- Inline: names, property access, `!x`, one comparison (`status === 'all'`), one simple ternary.
- Into a `computed`: combined conditions (`a || b`, `a && b && c`), nested ternaries, string building, formatting.
- Every event binds a script function, even one statement: `@click="handleCloseClick"`. Calls pass only loop/slot variables: `@click="handleDeleteClick(item)"`.

### Lint rules the code must pass

ESLint (`eslint-plugin-vue` + `@vue/eslint-config-typescript`) enforces these; write them right the first time:

- Macro variables are named `props`, `emit`, `slots`, `attrs` when assigned (`const emit = defineEmits…`, `const slots = useSlots()`). Destructured `defineProps` is fine.
- Every native `<button>` has `type="button"` / `"submit"` / `"reset"`.
- No static `style="…"` (bind it or use classes); one object at most in `:class`; static classes go in `class`, not inside `:class`.
- `ref()` with no starting value is typed: `ref<Contact>()`. Template refs use `useTemplateRef`.
- Types PascalCase, variables camelCase / PascalCase / UPPER_SNAKE, parameters camelCase.
- `<style scoped>` only; `<script setup lang="ts">` only; HTML comments spaced `<!-- like this -->`.

### Composables

All in `src/composables/`; single-page ones in `src/composables/pages/<url-mirror>/`. In files over ~150 lines, use dividers in this order: `// ── State ──` → `// ── Computed ──` → `// ── Actions ──` → `// ── Watchers ──` → `// ── Lifecycle ──`.

### Types

All in `src/types/`: `models/`, `api/<resource>/`, `components/`, `pages/<url-mirror>/`, barrel `index.ts`. Schema files export only schemas; their `XFormData` lives in `src/types/`.

### Constants and enums

`as const` object + derived type, together in `src/constants/x.constants.ts`. TypeScript `enum` is off-limits.

```ts
export const ORDER_STATUS = { PENDING: 'pending', SHIPPED: 'shipped' } as const
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
```

### Imports

- Auto-imported, never imported by hand: `vue`, `vue-router`, `pinia`, `@vueuse/core`, `src/composables/**`, `src/stores/` (`AutoImport({ dirs: ['src/composables/**', 'src/stores'] })` so sub-folders are picked up).
- Components: always imported explicitly, under their file name. Kit pieces from their subpath: `import { AppInput, useToast } from '@mhaamads/vue-kit/ui'`.
- Paths: `@/…` absolute. `./` only inside barrel `index.ts` files.

### Routing

```ts
// src/router/routes.ts
export const ROUTE = {
  CUSTOMERS: { NAME: 'customers', PATH: '/customers', PERMISSIONS: SALES_PERMISSIONS },
} as const

export const routes: RouteRecordRaw[] = [
  { path: ROUTE.CUSTOMERS.PATH, name: ROUTE.CUSTOMERS.NAME,
    component: () => import('@/pages/customers/index.vue'),
    meta: { permissions: ROUTE.CUSTOMERS.PERMISSIONS } },
]
```

Navigate with `{ name: ROUTE.X.NAME }`. Pages are always lazy. Permission groups are UPPER_SNAKE constants.

### API layer

Only `src/api/` knows URLs. One `xApi` object per resource. With the kit, `src/api/http.ts` creates the one client; without it, the `xApi` objects wrap the project's existing HTTP helper the same way:

```ts
// src/api/http.ts
import { createHttpClient } from '@mhaamads/vue-kit/http'

export const http = createHttpClient({
  baseUrls: { main: import.meta.env.VITE_API_URL },
  getHeaders: () => ({ Authorization: `Bearer ${useAuthStore().token}` }),
})

// src/api/contacts.api.ts
export const contactsApi = {
  list: (customerId: string) => http<ContactResponse[]>(`customers/${customerId}/contacts`),
  remove: (customerId: string, contactId: number) =>
    http<void>(`customers/${customerId}/contacts/${contactId}`, { method: 'DELETE', showSuccessToast: true }),
}
```

### Errors, loading, empty states

- The `http` client owns error toasts. Default shape: `try { … } finally { isLoading.value = false }`.
- Add `catch` only to act: roll back, set a field error, redirect. Custom message → `hideErrorToast: true` and toast once yourself.
- Success messages → `showSuccessToast: true`.
- Loading → a `*Skeleton.vue` in `components/skeletons/<url-mirror>/`. Empty → `NoDataFound` with an action slot.

### Forms and validation

With the kit: `defineSchema` from `@mhaamads/vue-kit/utils`; `<AppForm :schema :form-data @submit v-slot="{ errors }">` exposes the errors; each kit input gets `:errors="errors.field"`. Options when needed: `validate-on="blur"`, `warn-unsaved`, `resetValidation()` after loading a record. A lone field outside a form (a search box) checks itself with `:rules="{ required: true }"`. Without the kit: the project's own form component, same pattern (schema + errors slot). Layout with `DetailsBlock` + `form-fields-grid`.

```ts
export const createOrderSchema = ({ isDelivery = false } = {}) =>
  defineSchema<OrderFormData>({ address: { required: isDelivery, label: 'Address' } })
```

### Stores

Setup stores with arrow functions; return every piece of state. Stores hold cross-page state only (auth, UI, cached lookups); page state lives in the page or its composable.

### Styling

- Kit projects: kit components get their classes only from the `ui` class map (see Shared kit).
- Semantic classes only in components: `bg-surface-*`, `text-body`, `text-body-muted`, `border-neutral-default`, `card-default`, `page-spacing`, `gap-form`. Components carry no `dark:` variants.
- New projects: semantic colors are CSS variables (`--color-surface`) redefined under `[data-theme=dark]`. Existing `@utility` setups: add a missing pair as a new `@utility`.
- Raw palette tokens (`brand-500`) only for brand accents identical in both themes.
- **RTL-safe always**: logical classes whenever one exists, `ms`/`me`/`ps`/`pe`/`start`/`end`/`text-start`/`text-end`/`rounded-s`/`rounded-e`/`border-s`/`border-e`. Directional icons get `rtl:rotate-180`.
- Responsive with Tailwind breakpoints; `useWindowSize` only when the DOM itself must differ.

### i18n

Only when a second language is in scope: vue-i18n, `src/locales/<lang>.json`, dotted keys (`customers.list.title`).

The kit has its own texts (errors, buttons, AM/PM, calendar) and sets `lang` / `dir` on `<html>`: register each language once in `createVueKit({ locale, locales: { ckb: { dir: 'rtl', messages, dateLocale } } })`, and switch the app's language and the kit's together (`i18n.global.locale.value = 'ckb'` + `useVueKit().setLocale('ckb')`).

### Comments

Comments explain **why**. JSDoc `/** */` on exported functions whose behaviour the name doesn't tell. Git keeps old code, so delete it; delete `console.*` before finishing.

### Testing

Vitest, specs beside the code. Test logic: `utils/`, branching composables, `createXSchema` factories, `xApi` request shaping. Components and pages only when asked; Playwright smoke tests only when asked. Name tests by behaviour: `it('clears the discount when the country changes')`.

## When you finish

Run `npm run lint`, `npm run format` and `npm test`; fix what they report.

## Folder Structure

```
src/
├── main.ts · App.vue
├── router/          index.ts (createRouter + guards) · routes.ts (ROUTE + routes)
├── pages/           <url-mirror>/index|view|create|edit.vue
├── components/      ui/ · blocks/ · layout/ · cards/ · forms/<area>/ · inputs/ · pages/<url-mirror>/ · skeletons/<url-mirror>/
├── composables/     shared · pages/<url-mirror>/
├── api/             http.ts (kit projects) · <resource>.api.ts
├── stores/          x.store.ts
├── schemas/<area>/  x.schema.ts
├── types/           models/ · api/<resource>/ · components/ · pages/<url-mirror>/
├── constants/       x.constants.ts
├── utils/           pure helpers
├── plugins/         vue-kit.ts (kit projects: createVueKit + ui map) · auth.ts …
├── directives/ · locales/ (only with i18n)
└── assets/css/      main.css (tokens)
```

`components/pages/`, `composables/pages/`, and `types/pages/` use the **exact** folder path of the page they serve. Per-folder purpose and placement rules: [references/folder-structure.md](references/folder-structure.md).

## Do / Don't

| Do | Don't |
|---|---|
| `const { a = 1 } = defineProps<…>()` | `withDefaults(…)` |
| `defineEmits<{ save: [id: string] }>()` | `defineEmits(['save'])` |
| `@click="handleCloseClick"` | `@click="isOpen = false"` |
| `v-if="canCreateAccount"` (computed) | `v-if="a === 'x' \|\| a === 'y' \|\| b"` |
| `contactsApi.remove(customerId, contactId)` | `http('customers/…')` inside a component |
| `try { … } finally { isLoading.value = false }` | `catch { useToast({ type: 'error' }) }` beside `http` |
| `export const STATUS = { … } as const` | `enum Status { … }` |
| `type Customer = { … }` | `interface CustomerType { … }` |
| `bg-surface-100`, `ms-2`, `text-start` | `bg-white dark:bg-neutral-800`, `ml-2`, `text-left` |
| `import X from '@/components/ui/X.vue'` | `import { ref } from 'vue'`, `'../../x'`, `import DialogHeading from '…/Heading.vue'` |
| `{ name: ROUTE.X.NAME }` | `router.push('/customers')` |
| Kit projects: `import { AppInput } from '@mhaamads/vue-kit/ui'`, styled in the `ui` map | Copy, wrap or re-implement kit inputs, `AppForm`, `AppDialog`, `useToast` or the HTTP client |
| Projects without the kit: the project's own components | Add `@mhaamads/vue-kit` to them |
