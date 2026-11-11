# 02 — Research: what to add, remove, improve

Phase 2 of the shared-package work, 2026-11-11. Builds on [01-inventory.md](01-inventory.md).

> **Decision update (2026-11-11), overrides the packaging advice below.** The package is a **separate GitHub repo**. It is consumed by **new future apps only**. portal-iq-vue is not modified and never imports it; it is read-only reference code. As a result:
> - **A1 (internal source package) is replaced.** The package is a compiled library: Vite library mode, `vue` / `pinia` / `devextreme` externalised as `peerDependencies`, built ESM, `.d.ts` from `vue-tsc --declaration --emitDeclarationOnly` (or `unplugin-dts`), one CSS file, `exports` map.
> - **R5 flips to Add.** Versioning (Changesets or a manual SemVer tag) and a private registry (e.g. GitHub Packages) are needed from day one.
> - **Tailwind:** consumers get the package from `node_modules`, so they need `@source "../node_modules/@scope/pkg"` (or the package ships prebuilt CSS / a Tailwind preset). See the Tailwind source above.
> - **Phase 6 "replace usages in every mini app" no longer applies.** Each ticket ports a module into the new repo with its own tests.
> - **R1–R4, A2–A7, I1–I7 still apply,** but to the package code, not to portal-iq-vue.

## What the research says, applied to this repo

**Packaging.** There are two ways to share code through a workspace:

- **Internal (just-in-time) package.** `package.json` `exports` points at `.ts` / `.vue` source. The consuming app's bundler compiles it. No build step, no `.d.ts`, never published. Works with npm, pnpm and yarn workspaces. ([Turborepo: Internal packages](https://turborepo.com/docs/core-concepts/internal-packages), [You might not need TS project references](https://turborepo.com/blog/you-might-not-need-typescript-project-references))
- **Compiled package.** Vite library mode with `vue` externalised, one CSS file (`build.lib.cssFileName`), `.d.ts` from `vue-tsc --declaration --emitDeclarationOnly` or `unplugin-dts` (`vite-plugin-dts` is deprecated in its favour), and versions managed by Changesets. ([Vite: Library mode](https://vite.dev/guide/build.html#library-mode), [vite-plugin-dts → unplugin-dts](https://www.npmjs.com/package/vite-plugin-dts), [Changesets config](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md))

This repo already uses the first one: `packages/kanban-dnd` is `private: true`, `exports: { ".": "./src/index.ts" }`, `peerDependencies: { vue }`. The inventory found one consumer (this SPA; the legacy Quasar app is migrating *in*, not consuming). So the compiled path solves a problem we don't have. Turborepo's advice is to switch to compiled packages only when you publish, or when build time suffers.

**Tailwind v4.** Tailwind scans every file in the project except `.gitignore`d files and `node_modules`. A package under `packages/` is in the project, so it is picked up with no config. `@source "../node_modules/@scope/ui"` is only needed when a package comes from `node_modules`. ([Tailwind: Detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files))

**Overridable components.** All of these sources point the same way:

- Vue's docs: "use composables when reusing pure logic, and use components when reusing both logic and visual layout". Composables avoid the extra component instance that renderless components cost. ([Vue: Composables vs renderless components](https://vuejs.org/guide/reusability/composables.html#vs-renderless-components))
- Return a plain object of refs, and accept refs or getters via `toValue()`. ([same page](https://vuejs.org/guide/reusability/composables.html))
- Reka UI lets a consumer swap the rendered element and keep the behaviour (`asChild` / `as`). It forwards props and emits with `useForwardPropsEmits`. It sets app-wide `dir`, `locale` and the id source through one `ConfigProvider`. ([Reka UI: Composition](https://reka-ui.com/docs/guides/composition), [ConfigProvider](https://reka-ui.com/docs/utilities/config-provider))
- Headless UI passes all state out through scoped slots and leaves styling to the consumer. ([Adam Wathan: Renderless components](https://adamwathan.me/renderless-components-in-vuejs/))
- App-wide options go in through `app.use(plugin, options)` → `app.provide` → `inject`. ([Vue: Plugins](https://vuejs.org/guide/reusability/plugins.html))
- `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` on the real element is the documented way to send `class` and native attributes to the inner `<input>`. ([Vue: Fallthrough attributes](https://vuejs.org/guide/components/attrs))

**Accessible inputs:**

- Generate ids with `useId()` (Vue 3.5, already installed). ([Vue: Accessibility](https://vuejs.org/guide/best-practices/accessibility))
- Link the error to the field with `aria-describedby`. Use `role="alert"` for dynamic errors. On submit, move focus to the first invalid field. ([W3C WAI: Form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/))
- Set `aria-invalid="true"` from validation, but not on empty required fields before the first submit. Style with the `[aria-invalid="true"]` selector. ([MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid))

**RTL.** Tailwind ships `rtl:` / `ltr:` variants. Logical utilities (`ms-`, `ps-`, `start-`, `end-`) flip on their own. ([Tailwind: rtl/ltr variants](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support))

**Barrels.** Importing one name from a barrel makes Vite fetch and transform every file in it. Vite's advice is to import individual modules directly. ([Vite: Avoid barrel files](https://vite.dev/guide/performance.html#avoid-barrel-files))

## Add

| # | What | Why | Effort | Source |
|---|---|---|---|---|
| A1 | Shared code as **internal workspace package(s)** under `packages/`, copying the `kanban-dnd` setup: `private: true`, `exports` → source, `peerDependencies` on `vue` (and `pinia`, `devextreme` where used) | Gets the boundary without a build, `.d.ts` or versioning. Same pattern the repo already runs | S | [Turborepo internal packages](https://turborepo.com/docs/core-concepts/internal-packages) |
| A2 | **Subpath exports per area** (e.g. `./utils`, `./http`, `./ui`, `./data-grid`) instead of one barrel | Keeps DevExtreme and Tiptap out of pages that only want a button. Avoids the barrel cost Vite warns about. Today `@/shared/types` and `@/shared/utils` are barrels hit by ~110–260 files | S | [Vite: avoid barrel files](https://vite.dev/guide/performance.html#avoid-barrel-files) |
| A3 | **Lint rule for the boundary:** `no-restricted-imports` in the package forbidding `@/apps/*`, `@/stores/*`, `crm/*`, `task/*` | This is what actually stops app code leaking back into shared code. Without it the package is just a folder move | S | [ESLint: no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports) |
| A4 | **Plugin + `provide`/`inject` config** with typed `InjectionKey`s: HTTP (`getToken`, `getHeaders`, `onUnauthorized`, `baseUrls`), theme, component overrides | Replaces the 19 shared files that read shell stores directly (inventory finding 4). Also gives the "global override" level that Phase 4 needs | M | [Vue: Plugins](https://vuejs.org/guide/reusability/plugins.html), [Reka ConfigProvider](https://reka-ui.com/docs/utilities/config-provider) |
| A5 | **`useField` composable** owning id (`useId`), `aria-invalid`, `aria-describedby` → error id, `role="alert"` on errors, touched/dirty | Today no input links its error to the control. A non-standard `error="true"` attribute is used for styling (audit #12) | M | [W3C forms](https://www.w3.org/WAI/tutorials/forms/notifications/), [MDN aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) |
| A6 | **Component test setup:** `@vitejs/plugin-vue` in `vitest.config.ts` + `happy-dom` (already installed) + `@vue/test-utils` (**new dev dependency**) | Phase 4's "same suite on default and custom UI" needs to mount SFCs. Today `vitest.config.ts` has no Vue plugin and only `src/**/*.spec.ts`. Built-in alternative: hand-mount with `createApp` + `happy-dom`, which works but means re-writing `mount`/`trigger`/`setValue` | M | [Vue: Testing](https://vuejs.org/guide/scaling-up/testing.html#component-testing) |
| A7 | **Tests before moving** `buildFilterArray` and `validate()` | Both are pure, used by 29 grids / every form, and have zero tests. A move without them is blind (audit #4, #5) | S | — |

## Remove

| # | What | Why | Effort | Source |
|---|---|---|---|---|
| R1 | **Auto-imports inside package code.** 86 of 206 shared files use auto-imported names (`computed` 54, `ref` 32, `watch` 21, … and `useAuthStore`/`useHttp`/`useEnv`/`useToast` 6 each) | Package files would only type-check with the app's generated `auto-imports.d.ts`. Store auto-imports are exactly the hidden coupling A3 must catch. Explicit `import { ref } from 'vue'` in the package; the app keeps its auto-imports | M (mechanical) | [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) |
| R2 | **Dead code:** `useTour` + `tour-types.ts` + `tour.css` + `driver.js`; `task-status-options.ts`; `DateBuilder` → native date math, then drop `luxon` + `@types/luxon` | −~430 lines and −2 dependencies before they become package API (inventory rows 38–39, audit #9, #10) | S | — |
| R3 | **App-specific types in `src/shared/`** (`shared/{models,types,constant}/apps/*`, ~60 files) → move into `src/apps/<app>/` | They are not shared. Moving them into a package would make CRM types "public API" (inventory rows 31–34) | M | — |
| R4 | **Non-standard `error` attribute and `classList` / `labelClassList` props on inputs** | Replaced by `[aria-invalid="true"]` styling and plain `class` passthrough (I4). Fewer props, standard behaviour | S | [MDN aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid) |
| R5 | **Do not add (yet):** Vite library mode, `.d.ts` generation (`vue-tsc` / `unplugin-dts`), Changesets, a private registry, a separate repo | All four exist to publish. With one consumer they add a build, a release flow and version skew for nothing. Turn on when a second app outside this build needs the code | — | [Turborepo: when to compile](https://turborepo.com/docs/core-concepts/internal-packages), [Changesets: private packages are not versioned by default](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) |

## Improve

| # | What | Why | Effort | Source |
|---|---|---|---|---|
| I1 | **`useHttp` reads config through injection, keeps `fetch`.** Auth refresh, logout, branch headers and the email-required gate stay in the app and are passed in | It is the most-used shared module (102 files) and the most coupled: auth store, metadata store, env, toast. Fix the two audit bugs (success toast, `v-html`) first, in their own commit | M | [Vue: Plugins](https://vuejs.org/guide/reusability/plugins.html) |
| I2 | **Theme from CSS, not the store.** `Badge`, `Tabs`, `DateInput`, `DataGrid` read `useUserInterfaceStore().theme`. Tailwind's `dark` variant already keys off `[data-theme=dark]` (`main.css:17`), so most of these can drop the store. `DataGrid` (lazy-loads `dx.light/dark.css`) and the vue-datepicker `dark` prop still need a value; inject it | Removes 4 store reads from UI primitives | S–M | [Tailwind: dark mode, custom variant](https://tailwindcss.com/docs/dark-mode) |
| I3 | **Overrides = composable + thin default skin + scoped slot.** Logic in `useX()`, default component renders it, a default slot exposes `{ inputProps, labelProps, errorProps, … }`. No `asChild` clone-props machinery (Reka needs it for many primitives; we have one input family) | Vue's docs recommend composables for logic and components for logic + layout. The Reka/Headless pattern without its extra layer. Input logic today is in the SFC: `normalizeInputValue`, mask, the Chrome tel re-render hack (`Input.vue:150-163`) | M | [Vue: composables vs renderless](https://vuejs.org/guide/reusability/composables.html#vs-renderless-components), [Reka composition](https://reka-ui.com/docs/guides/composition) |
| I4 | **Fix attribute fallthrough on inputs.** `Input.vue` binds `v-bind="attrs"` on the `<input>` but never sets `inheritAttrs: false`, so every attribute and listener also lands on the wrapper `<div>`. Example: `TaskChecklists.vue:33` `@keydown.enter` fires on the input and again when the event bubbles to the div. It is only safe today because `useTaskChecklists.ts:77` guards with `isSavingCheckListEdit` | The "props & attrs" override level needs attributes to land on one element only | S | [Vue: Fallthrough attributes](https://vuejs.org/guide/components/attrs) |
| I5 | **RTL: finish the logical-class switch and add a `dir` option.** Shared UI already uses 67 logical classes vs 6 physical; apps have 13 physical | Almost free now; costly once there are two directions to test. No i18n library needed until there is a second language | S | [Tailwind rtl/ltr](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support), [Reka ConfigProvider `dir`](https://reka-ui.com/docs/utilities/config-provider) |
| I6 | **Merge the near-duplicates** from inventory rows 23–28 (`toCodeNameOptions` ×6, `formatDate` ×5, `toLocalISOString` ×3, image viewers ×2, chart file name ×3, `isSmallScreen` → `useBreakpoints` from `@vueuse/core`) | Copies that must change together | S each | [VueUse useBreakpoints](https://vueuse.org/core/useBreakpoints/) |
| I7 | **Invert `auth-store.ts:9` → `@/apps/crm/routes`.** Move `operationalCrmPermissionKeys` next to the permission keys | Only shared → app import in the tree. Blocks anything touching auth (audit #6) | S | — |

## Not relevant here

- **Validation library.** The hand-written `defineSchema` / `validate` has no outside dependency and covers the forms. Swapping it is a behaviour change. Keep it, add tests (A7). Phase 3 question 5.
- **CSS delivery and `sideEffects`.** Only matter for a compiled package consumed from `node_modules`. In-repo source packages go through the app's Vite and Tailwind as they do today.
- **Tree-shaking.** Rollup already tree-shakes source ESM in the app build. The real cost is dev-server barrels (A2).

## Other sources

[Vite library-mode bundle-size case study](https://dev.to/phumbie/optimizing-vuejs-component-library-bundle-size-a-real-world-case-study-2980) · [Tailwind v4 in an npm workspace (Nx)](https://nx.dev/blog/setup-tailwind-4-npm-workspace) · [Tailwind discussion #19118 (monorepo `@source`)](https://github.com/tailwindlabs/tailwindcss/discussions/19118) · [Changesets release workflows](https://blog.openreplay.com/release-workflows-changesets/) · [vue-tsc declaration emit guide](https://dev.to/rashidshamloo/exporting-declaration-files-in-vitejs-f6m)
