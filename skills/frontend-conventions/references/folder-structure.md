# Folder structure (single app)

```
src/
├── main.ts
├── App.vue                     kit projects: mounts <AppConfirmDialog />, <AppToasts /> once
├── router/
│   ├── index.ts
│   └── routes.ts
├── pages/
│   └── customers/
│       ├── index.vue
│       ├── view.vue
│       ├── create.vue
│       ├── edit.vue
│       └── contacts/
│           ├── create.vue
│           └── edit.vue
├── components/
│   ├── ui/                     app-only primitives: Badge.vue, Tabs.vue, Breadcrumb.vue
│   ├── blocks/                 DetailsBlock.vue, NoDataFound.vue
│   ├── layout/                 DefaultLayout.vue, header/, sidebar/
│   ├── cards/                  ContactCard.vue
│   ├── forms/
│   │   └── customer/
│   │       ├── CompanyForm.vue
│   │       └── block/          AddressFormBlock.vue
│   ├── inputs/                 CustomerSelect.vue
│   ├── pages/
│   │   └── customers/          CustomersGridView.vue, ArchiveCustomerDialog.vue
│   └── skeletons/
│       └── customers/          CustomerDetailsSkeleton.vue
├── composables/
│   ├── useOrderForm.ts
│   └── pages/
│       └── customers/          useContacts.ts
├── api/                        http.ts (kit projects), customers.api.ts, contacts.api.ts
├── stores/                     auth.store.ts, ui.store.ts
├── schemas/
│   └── customer/               contact.schema.ts, order.schema.ts
├── types/
│   ├── index.ts
│   ├── models/                 customer.model.ts, contact.model.ts
│   ├── api/
│   │   ├── auth/               login.request.ts, login.response.ts
│   │   └── contacts/           update-contact-role.request.ts
│   ├── components/             select.types.ts, validation.types.ts
│   └── pages/
│       └── customers/contacts/  contact-form.types.ts
├── constants/                  contact.constants.ts, permission.constants.ts
├── utils/
│   └── date.ts · date.spec.ts
├── directives/                 v-can, v-tooltip
├── plugins/                    vue-kit.ts (kit projects), auth.ts, i18n.ts
├── locales/                    en.json, ku.json   (only with i18n)
└── assets/css/
    ├── main.css                @theme tokens + semantic classes
    └── <feature>.css           anything over 60 lines of style
```

## What each folder is for

| Folder | Holds | Rule of thumb |
|---|---|---|
| `router/` | `index.ts`: `createRouter`, guards (auth, permissions). `routes.ts`: `ROUTE` config + lazy `routes`. | Guards read `meta.permissions`; pages never check routing permissions themselves. |
| `pages/` | One `.vue` per route, nested exactly like the URL. | A page wires data and layout; reusable UI goes to `components/`. |
| `components/ui/` | App primitives the kit doesn't have. | Knows nothing about the domain. Never a copy of a kit component. |
| `components/blocks/` | Generic composed blocks built from primitives. | Still domain-free (`DetailsBlock`, `NoDataFound`). |
| `components/layout/` | App shell: layout, header, sidebar. | Only `App.vue` / the router layout use these. |
| `components/cards/` | Domain entity cards used on 2+ pages. | One entity per card. |
| `components/forms/<area>/` | Domain forms used on 2+ pages; `block/` = form sections. | A form emits `submit`; the page calls the API. |
| `components/inputs/` | Domain-aware inputs (`CustomerSelect`). | A kit input (`AppSelect`) + its data source. |
| `components/pages/<url>/` | Components used by exactly one page. | Same path as the page folder. |
| `components/skeletons/<url>/` | Loading placeholders for a page. | Same path as the page folder. |
| `composables/` | Shared composables (auto-imported). `pages/<url>/` for single-page ones. | `useX` only when it uses reactivity/lifecycle/inject. |
| `api/` | `http.ts` (the kit client) + one `xApi` object per resource; the only place with URLs. | Typed with `types/api/<resource>/`. |
| `stores/` | Setup stores for cross-page state (auth, UI, cached lookups). | Page state stays in the page/composable. |
| `schemas/<area>/` | `defineSchema` schemas and `createXSchema` factories. | Exports schemas only; form types live in `types/`. |
| `types/` | All types. `models/` entities, `api/<resource>/` requests + responses, `components/` UI types, `pages/<url>/` single-page types. | Exception: a const-derived type sits beside its const. |
| `constants/` | `as const` objects + derived types, option arrays, lookup maps. | UPPER_SNAKE. |
| `utils/` | Pure functions, no Vue reactivity. | Each non-trivial util gets a `.spec.ts`. |
| `directives/` | Global directives registered in `main.ts`. | |
| `plugins/` | Setup: `vue-kit.ts` (the kit + its `ui` class map), auth, i18n. | |
| `locales/` | vue-i18n JSON files. | Only when a second language is in scope. |
| `assets/css/` | `main.css` tokens + semantic classes; larger feature CSS. | Components keep `<style scoped>` ≤ 60 lines. |

## Placement decisions

- **Used by one page** → `components/pages/<url>/`, `composables/pages/<url>/`, `types/pages/<url>/`.
- **Used by a second page** → move it up: `components/cards|forms|inputs/`, `composables/`, `types/models|components/`.
- **Domain-free and useful in another app** → candidate for the kit.

## Rejected alternative: feature folders

`features/<feature>/{components,composables,types,api}` keeps a feature together and is easy to delete. The owner chose central-by-kind folders with page mirrors so every kind of file has one root and the page path finds everything. Don't introduce feature folders.

## The kit (only when the project uses it)

In a project with `@mhaamads/vue-kit`, three files wire it in:

```ts
// src/plugins/vue-kit.ts: the kit and its look (the kit ships no CSS)
import { createVueKit } from '@mhaamads/vue-kit/ui'

export const vueKit = createVueKit({
  ui: {
    input: { root: 'flex flex-col gap-1', label: 'text-body text-sm', control: 'card-default px-3 py-2' },
    button: { primary: 'bg-primary text-on-primary rounded-lg px-4 py-2', secondary: '…' },
  },
})
// main.ts: app.use(vueKit)
```

```vue
<!-- src/App.vue: once, so useToast() / useConfirm() work everywhere -->
<RouterView />
<AppToasts />
<AppConfirmDialog />
```

`src/api/http.ts` creates the HTTP client (see `SKILL.md` → API layer). Every `ui` key and option: https://mhaamads.github.io/vue-kit/
