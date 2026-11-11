# 01 — Shared code inventory

Phase 1 of the shared-package work. Read-only scan, 2026-11-11, branch `stage` @ `421a7b22`.

## Headline findings

1. **The shared code is already centralised.** About 210 files live in `src/shared/`, `src/components/ui/`, `src/components/blocks/`, `src/stores/` and `src/directives/`. The four mini apps (`crm`, `task`, `hr`, `finance`) import them through `@/…`. There are almost no copy-pasted *modules* between apps. The duplication is in small *helpers* inside pages (see the Merge rows).
2. **There is one consumer.** All four apps ship in one Vite build. The sibling `Portal.IQ.Frontend` (Quasar + Vuex, Vue 3) is the legacy app being migrated *into* this repo (`../migration-instruction.md`). It will not consume a package. So extracting buys a **boundary** (shared code cannot reach into apps or the shell), not reuse in a second app. That is the first question for Phase 3.
3. **`src/shared/` is not all shared.** About 60 files under `shared/models/apps/*`, `shared/types/apps/*`, `shared/types/api-response-types/apps/*` and `shared/constant/apps/*` are domain types of one app. They are marked "Leave in app" (move to the owning app).
4. **What blocks a clean package is coupling to the shell's stores.** 19 shared UI files call `useAuthStore`, `useUserInterfaceStore`, `useMetadataStore`, `useHttp`, `useEnv` or `useRoute` through auto-imports. One shared store imports from an app (`stores/auth-store.ts:9` → `@/apps/crm/routes`).
5. **No i18n and no RTL today.** No `vue-i18n`, no `$t(`. Only `BlockTabs.vue` mentions `dir`. Inputs already use logical CSS (`ps-*`, `end-*`), so RTL is cheap to add later.

How usage was counted: every `import` was resolved (aliases `@`, `crm`, `task`, relative paths, barrels one level deep). Auto-imported names from `src/shared/composables` and `src/stores` were matched by name. "Shell" = `components/layout`, `components/pages`, `pages/`, `router/`, `plugins/`, `App.vue`, `main.ts`. Counts for files behind the big barrels (`@/shared/types`, `@/shared/utils`) are inflated and are left out.

## Inventory

Sorted by value of extracting: high reuse and high duplication first. "Apps" = which of crm / task / hr / finance / shell import it. "Files" = importing files.

### Tier 1 — high reuse, low coupling → Extract

| # | Candidate | Path(s) | Apps | Files | Duplicates | Coupling | Mark |
|---|---|---|---|---|---|---|---|
| 1 | Button, text, icon | `components/ui/AppButton.vue`, `AppText.vue`, `Iconsax.vue` (+ `types/components-types/{button,text,iconsax}-types.ts`, the icon list is 1 886 lines) | all 5 | 160 / 122 / 97 | — | none (Tailwind tokens only) | **Extract** |
| 2 | Text input | `components/ui/form/inputs/Input.vue` (+ `Label.vue`, `Error.vue`, `CountryCode.vue`, `CopyButton.vue`, `data/country-code.ts`) | all 5 | 51 | `PhoneInput.vue` (crm, 1 user) wraps the same tel logic | `maska`, `tailwind-merge`. Logic sits in the SFC (no composable). No `aria-invalid` / `aria-describedby`; errors are not linked to the input | **Extract** (Phase 4 redesign target) |
| 3 | Select | `form/inputs/Select.vue` (454 lines) + `SelectElements/*` | crm, task, hr, shell | 41 | `apps/crm/components/inputs/CustomerSelect.vue` is a remote-search wrapper | `@floating-ui/vue`, `@tanstack/vue-virtual` | **Extract** |
| 4 | Overlays | `components/ui/overlays/Dialog.vue`, `Drawer.vue`, `Heading.vue` | all 5 | 38 / 10 / 34 | — | none | **Extract** |
| 5 | Badge, tabs, page bits | `Badge.vue`, `Tabs.vue`, `PageTitle.vue`, `Breadcrumb.vue`, `ListingPageHeading.vue`, `blocks/NoDataFound.vue`, `blocks/DetailsBlock.vue`, `blocks/InfoBlock.vue`, `InfoItem.vue`, `InfoRow.vue`, `NameAvatar.vue`, `CopyableText.vue` | 3–5 each | 6–51 | — | `Badge` and `Tabs` read the theme from `useUserInterfaceStore` (replace with a prop or injected theme) | **Extract** |
| 6 | Toast + confirm composables | `shared/composables/useToast.ts` (7 lines), `useConfirm.ts`, `useOverlay.ts`, `stores/toast-store.ts`, `components/ui/alert/Toast.vue`, `Toasts.vue`, `ConfirmDialog.vue` | all 5 | 30 / 32 | — | Pinia store; `Toast.vue` renders `v-html` unsanitised (audit #2) | **Extract** |
| 7 | Other form inputs | `DateInput.vue`, `Checkbox.vue`, `CheckboxGroup.vue`, `Radio.vue`, `RadioGroup.vue`, `Switch.vue`, `TimeInput.vue` (+ `TimeInput/TimeColumn.vue`), `ColorPickerInput.vue` | 1–5 | 1–16 | `pad()` re-written in `TimeInput.vue` and 3 app files | `DateInput` reads theme from ui-store; `@vuepic/vue-datepicker`, `vue3-colorpicker` | **Extract** |
| 8 | Form wrapper + validation | `components/ui/form/Form.vue`, `shared/utils/validate/*` (`defineSchema`, `validate`, `messages`, `validators`), `shared/types/validation-types.ts` | crm, task, shell | 24 (Form) / 11–20 | — | `Form.vue` reads `useDevToolsStore` (dev-only toggle). Validation is pure TS, **no tests** | **Extract** |
| 9 | Floating / menus | `FloatingBox.vue` (298), `Dropdown.vue`, `GroupedOptionsDropdown.vue`, `ActionMenu*.vue`, `action-menu-context.ts` | crm, task, hr, shell | 21 / 17 | — | `FloatingBox` calls `useRoute()` (closes on route change) | **Extract** (route close via prop/emit) |
| 10 | Pure utils | `shared/utils/date-utils.ts`, `color-utils.ts`, `image-utils.ts`, `global-events.ts`, `message-bridge.ts`, `last-filter-utils.ts` | 2–5 | 4–7 direct | `formatDate` re-defined locally 5×, `toLocalISOString` 3× (see Merge) | `date-utils` pulls `luxon` for one wrapper class (audit #9) | **Extract** |
| 11 | Small composables | `useFileDrop.ts`, `useUniqueId.ts`, `useLastFilter.ts`, `useTableState.ts` + `stores/table-state-store.ts` | 1–4 | 2–6 | — | `useTableState` needs the router `afterEach` hook in the shell | **Extract** (useFileDrop, useUniqueId); others with DataGrid |
| 12 | Generic types | `shared/types/http-types.ts`, `components-types/*`, `router-types.ts`, `z-index-types.ts`, `file-icon-type.ts`, `permission-types/index.ts` (keys only) | all | barrel | — | none | **Extract** (the generic ones) |
| 13 | Directives | `directives/tooltip-directive.ts`, `draggable-directive.ts` | shell, task | 1–2 | — | none | **Extract** |

### Tier 2 — high reuse, coupled to the shell → Extract after decoupling

| # | Candidate | Path(s) | Apps | Files | Coupling to remove first | Mark |
|---|---|---|---|---|---|---|
| 14 | HTTP client | `shared/composables/useHttp.ts` (299), `HttpError`, `shared/types/http-types.ts` | crm, task, finance, shell | 102 | Reads `useAuthStore` (token, branch headers, refresh, logout, email-required), `useMetadataStore` (API version), `useEnv` (base URLs), `useToast`. Needs an injected config: `getToken`, `getHeaders`, `onUnauthorized`, `baseUrls`. 2 audit findings | **Extract** (core) / **Leave in app** (auth wiring) |
| 15 | DataGrid + custom filter pipeline | `components/ui/dev-extreme/*` (13 files, `DataGrid.vue` 452, `DxCustomFilter.vue` 368), `Charts/*`, `pagination/*`, `shared/utils/dev-express-utils.ts` (380), `types/components-types/dev-express-types.ts` | all 5 | 29 (DataGrid) / 18 (badges) | DevExtreme 24.2.15 pinned; theme from ui-store; `useTableState`; lazy selects call `useHttp`. `buildFilterArray` is the core and has **no tests** | **Extract** as its own entry point (heavy peer dep) |
| 16 | Image + file upload | `Image.vue`, `ImagePreview.vue` + `stores/image-preview-store.ts`, `AttachmentLightbox.vue`, `form/inputs/FileUpload.vue` (259) | crm, task, shell | 6–15 | Build URLs from `useEnv` + `authStore.accessToken` in the query string | **Extract** (URL builder injected) |
| 17 | Rich text + comments | `form/inputs/Tiptap/*` (`TextEditor.vue`, `editor-options.ts` 392), `components/ui/comment/*` (`CommentInput.vue` 478) | hr, task, crm | 2–3 | Comments import `TaskModel` types and read `useAuthStore` / `useMetadataStore` (reactions) | **Extract** Tiptap; **Leave in app** comments until types are generic |
| 18 | Recurrence / schedule | `RecurrenceSchedule.vue` (338), `ScheduleSummary.vue`, `DurationTimeline.vue` | crm, task | 3–4 | Uses `DateBuilder` (luxon) | **Extract** later |
| 19 | Permission directive | `directives/permission-directive.ts` (`v-can`) | all 5 | 17 | Reads `useAuthStore().userCurrentPermissions`. Logic is a 3-line any-of check | **Extract** with injected permission source |
| 20 | Socket | `shared/composables/useSocket.ts` (210) | shell | 3 | Shell-only today, hub URL derived from the main API URL | **Leave in app** |
| 21 | Scroll helpers | `VirtualScroll.vue`, `InfiniteScroll.vue` | crm, task, shell | 2–3 | none | **Extract** later (low reuse) |
| 22 | `useEnv` | `shared/composables/useEnv.ts` | all | 29 | Reads `import.meta.env` and the metadata store | **Leave in app** (config is the app's job) |

### Merge — near-duplicates inside apps

| # | What | Copies | Merge into | Mark |
|---|---|---|---|---|
| 23 | `toCodeNameOptions` (Code/Name list → options) | 6 identical: `apps/crm/composables/useActivityForm.ts:110`, `forms/account/B2BAccountForm.vue:160`, `B2CAccountForm.vue:161`, `block/PropertyInvestmentBlock.vue:49`, `block/SecondPassportBlock.vue:46`, `cards/RequestNoteAndAuditsCard.vue:530` | one export in `apps/crm/utils` (crm-only, so not the package) | **Merge** |
| 24 | Local `formatDate` | 5: `useActivityForm.ts:444`, `ApprovalChainTimeline.vue:168`, `ApprovalAttemptsHistoryDialog.vue:198`, `TaskAuditDialog.vue:93`, `layout/header/SystemHealthDialog.vue:162` | `shared/utils/date-utils.ts` `formatDate` (add a date-time format) | **Merge** |
| 25 | `toLocalISOString` + `pad` | 3: `TaskForm.vue:564`, `CopyTaskDialog.vue:202`, `TaskAiAssistantLauncher.vue:411` (+ `pad` in `TimeInput.vue:134`) | `date-utils.ts` | **Merge** |
| 26 | Fullscreen image viewers | `apps/crm/components/common/PassportFullscreenViewer.vue` and `apps/task/components/common/TaskCoverFullscreenViewer.vue` differ by URL path, `<Teleport>` and a reload key; `ui/AttachmentLightbox.vue` wraps the same `vue-easy-lightbox` | one viewer with a `src` prop | **Merge** |
| 27 | Chart export file name | `new Date().toLocaleString('sv').replace(…)` 3× in `Charts/DxCustom{Bar,Line,Pie}Chart.vue` | one helper in `Charts/` | **Merge** |
| 28 | `isSmallScreen` from `screenWidth` | 5 (breakpoints 930 / 1024) | `useBreakpoints` from `@vueuse/core` (already installed) | **Merge** |
| 29 | Report `buildChartConfigs` + `today` defaults | 6 report chart files + 5 report tables | stays per report (different series); only the date default is shared | **Leave in app** |
| 30 | `downloadErrors` | 3 in `apps/crm` b2b-bulk | one function in the b2b-bulk page folder | **Merge** (crm-local) |

### Leave in app — app-specific code that lives in `src/shared/`

| # | Candidate | Path(s) | Owner | Mark |
|---|---|---|---|---|
| 31 | CRM models, types, constants | `shared/models/apps/crm/*`, `shared/types/apps/crm/*`, `shared/types/api-response-types/apps/crm/*`, `shared/constant/apps/crm-constants/*` (685-line admin-space constants) | crm | **Leave in app** (move to `src/apps/crm`) |
| 32 | Task models, types, constants | `shared/models/apps/task/*` (`task-model.ts` 221), `shared/types/apps/task/*`, `api-response-types/apps/task/*`, `constant/apps/task-constants/*`, `src/composables/useTaskPreferences.ts` | task | **Leave in app** (shell also reads `TaskModel` and task prefs) |
| 33 | HR types + client | `shared/types/apps/hr/index.ts`, `api-response-types/apps/hr`, `apps/hr/shared/hr-api.ts` (own `fetch`, Strapi params) | hr | **Leave in app** (audit #1) |
| 34 | Operation types | `api-response-types/apps/operation/*` | operation (migrating) | **Leave in app** |
| 35 | Shell stores + auth | `stores/auth-store.ts` (437), `metadata-store.ts`, `permissions-store.ts`, `ui-store.ts`, `dev-tools-store.ts`, `plugins/msal.ts`, `components/ui/alert/EmailRequiredDialog.vue`, `components/dev-tools/*` | shell | **Leave in app**. `auth-store.ts:9` imports `operationalCrmPermissionKeys` from `@/apps/crm/routes` — invert so the router passes it in |
| 36 | User / branch / notification models | `shared/models/user-model.ts` (192), `branch-model.ts`, `notification-model.ts`, `permissions.ts` | shell | **Leave in app** |
| 37 | DX license patch | `shared/utils/remove-dx-license.ts` | shell (`main.ts`) | **Leave in app** |

### Delete — no users

| # | What | Evidence | Mark |
|---|---|---|---|
| 38 | Product tour | `shared/composables/useTour.ts` (87), `shared/types/tour-types.ts` (183), `assets/css/tour.css` (139, imported from `main.css`), dependency `driver.js`. `useTour` has 0 callers (grep across `src` and `index.html`) | **Delete** (−409 lines, −1 dependency) |
| 39 | `task-status-options.ts` | `shared/types/apps/task/task-status-options.ts` (13), 0 importers | **Delete** |

## `/ponytail-debt` — deferral ledger

`src/apps/finance/utils/reconcile.ts:124`, balancing-set search stays one-sided for groups of 4+. ceiling: `MAX_GROUP` lines / `SEARCH_BUDGET` steps / `TIME_LIMIT_MS`. upgrade: none named (true mixed-side subset-sum is exponential). `no-trigger`
`src/apps/task/components/pages/task-board/dialogs/ExportDialog.vue:231`, export archive is buffered in memory. ceiling: ~100 MB per bucket. upgrade: stream via POST to a new tab past that size.

2 markers, 1 with no trigger. Neither is in shared code, so neither blocks the package.

## `/ponytail-audit` — shared code

**What this repo does:** A Vue 3 single-page "super app" for staff: CRM, tasks, HR job applications and finance reconciliation, all in one build that talks to several backends. Assumed load: tens to a few hundred staff in the browser at once. Each browser runs its own copy, so "load" here means per-user correctness and safety, not server throughput.

Scope: the shared code in the inventory above, plus `apps/hr/shared/hr-api.ts`. Read fully: `useHttp.ts`, `useEnv.ts`, `date-utils.ts`, `sanitize-html.ts`, `hr-api.ts`, `Input.vue`, `Label.vue`, `Error.vue`, the two viewers. Skimmed by grep: everything else.

### Must fix

1. **HR API token ships to every browser** (`src/shared/composables/useEnv.ts:28`, `src/apps/hr/shared/hr-api.ts:79-81`, `.github/workflows/{main,stage}.yml`)
   - **What this is:** HR pages call the careers API with a fixed bearer token taken from `VITE_JOB_API_TOKEN`.
   - **Problem:** Vite copies every `VITE_*` value into the public JS bundle. Anyone who loads the site, even before login, can read the token and call the careers API directly, with no portal permission check.
   - **Fix:** Move the token to the server side: the main API (or IIS reverse proxy) forwards HR calls and adds the token. Then delete `jobApiToken` from `useEnv` and the workflows, and rotate the token.
   - **If we skip it:** Job applications (personal data, CVs) can be read or changed by anyone who opens dev tools.

2. **Server error text is rendered as raw HTML** (`src/components/ui/alert/Toast.vue:17`, `src/shared/composables/useHttp.ts:133-149`)
   - **What this is:** Every failed request shows a toast with the backend's error message. The toast uses `v-html`.
   - **Problem:** Backend validation messages often repeat what the user typed (a name, a code). A value like `<img src=x onerror=…>` comes back in the error and runs as script in the next viewer's browser, e.g. an admin reviewing it.
   - **Fix:** Wrap the message with the existing `sanitizeHtml` from `src/shared/utils/sanitize-html.ts` in `Toast.vue`. One line; the `<ul>` list still renders.
   - **If we skip it:** Stored script injection through any endpoint that echoes input in its error.

3. **Success toast never shows for most calls** (`src/shared/composables/useHttp.ts:268`)
   - **What this is:** `showSuccessToast: true` should show "X created successfully" after a write.
   - **Problem:** The check needs `options.responseType === 'json'`. The default `{ responseType: 'json' }` applies only when no options are passed at all. 22 of 24 callers pass `showSuccessToast` without `responseType`, e.g. `ProductOwnerFormDialog.vue:143-148`. When the endpoint returns a JSON body, they get no toast.
   - **Fix:** `(options.responseType ?? 'json') === 'json'`. One line.
   - **If we skip it:** Users see no confirmation after saving and save again.

### Should fix

4. **Filter pipeline has no tests** (`src/shared/utils/dev-express-utils.ts`, `buildFilterArray`)
   - **What this is:** Turns every list page's filters into the backend filter array.
   - **Problem:** It is the core of 29 grids. It already has known traps (`date` uses the local day as naive strings while `range` uses UTC midnight; `datetime` falls through to `=`). A change here breaks every list silently.
   - **Fix:** One `dev-express-utils.spec.ts` covering empty values, array → `or`, `range`, `date`. Needed before it moves into a package anyway.
   - **If we skip it:** The extraction itself can change filter results with no test catching it.

5. **Validation has no tests** (`src/shared/utils/validate/index.ts`)
   - **What this is:** Hand-written schema validation for every form.
   - **Problem:** Nested objects and arrays use a `_self` key. One wrong branch drops errors for a whole sub-form and the user can submit bad data.
   - **Fix:** One spec with a nested object, an array and `_self`.
   - **If we skip it:** Moving it to a package is a blind move.

6. **Shared store imports from an app** (`src/stores/auth-store.ts:9`)
   - **What this is:** The auth store needs the list of CRM permissions that operation-only users may use.
   - **Problem:** Shared code depends on `@/apps/crm/routes`, so it cannot move without dragging the CRM routes along. Any import cycle through routes → pages → auth store breaks start-up.
   - **Fix:** Move `operationalCrmPermissionKeys` to `shared/types/permission-types` (it is a list of keys) and import it from both places.
   - **If we skip it:** Blocks extracting anything that touches auth.

7. **Six copies of `toCodeNameOptions`** (inventory row 23)
   - **What this is:** Turns `{ Code, Name }` lists into select options.
   - **Problem:** Six identical copies must change together. One fix (e.g. sorting) will miss the others.
   - **Fix:** One export, six imports.
   - **If we skip it:** Different forms show the same list in different shapes.

8. **Two near-copy image viewers** (inventory row 26)
   - **What this is:** Fullscreen viewers for passports and task covers.
   - **Problem:** Same component, different URL. Only one of them teleports to `<body>`, so the passport one can render under a dialog's stacking context.
   - **Fix:** One `FullscreenImageViewer` with a `src` prop and the teleport.
   - **If we skip it:** The z-index bug stays on one of them.

9. **`luxon` for one plus/minus wrapper** (`src/shared/utils/date-utils.ts:56-75`)
   - **What this is:** `DateBuilder` adds or subtracts days/months.
   - **Problem:** A whole date library for `minus`/`plus`. `shiftDateMonth` in the same file already does month math natively.
   - **Fix:** Replace the 4 call sites with `shiftDateMonth` and `setDate(getDate() ± n)`, then drop `luxon` and `@types/luxon`.
   - **If we skip it:** An extra dependency inside the package's public surface.

10. **Dead product-tour feature** (inventory row 38)
    - **What this is:** `useTour` wrapper around `driver.js` with its types and CSS.
    - **Problem:** Zero callers. 409 lines and a dependency that are read, type-checked and shipped for nothing.
    - **Fix:** Delete the four pieces.
    - **If we skip it:** It gets copied into the package and becomes "public API".

### Nice to have

11. **Access token in image URLs** (`Image.vue`, `FileUpload.vue`, both viewers: `?access_token=…`)
    - **What this is:** Images load from authenticated endpoints, so the token goes in the query string.
    - **Problem:** Query strings land in IIS logs, browser history and proxy logs.
    - **Fix:** Backend-side: short-lived signed URLs or a cookie. Out of scope for the package; noted so the package's URL builder does not bake it in.
    - **If we skip it:** Tokens sit in logs until they expire.

12. **Inputs miss basic ARIA wiring** (`form/inputs/Input.vue`, `Error.vue`, `Select.vue`, `DateInput.vue`, `Switch.vue`)
    - **What this is:** Labels use `for`, but errors are not linked to the input.
    - **Problem:** Screen readers do not hear the error; `aria-invalid` is never set (the code sets a non-standard `error` attribute for styling).
    - **Fix:** Part of the Phase 4 input composable (`aria-invalid`, `aria-describedby` → error id, `role="alert"` on the error list).
    - **If we skip it:** Forms stay unusable with a screen reader.

Verdict: fix 1 (token) and 2 (`v-html`) first; they are security, not refactoring. 3 is a one-liner.
Lean: −~430 lines, −2 dependencies possible (`driver.js`, `luxon` + `@types/luxon`).
Not checked: app pages and app components (outside shared code), `packages/kanban-dnd`, the `auth-store.ts` refresh path in depth, CSS files, runtime behaviour (nothing was run).
