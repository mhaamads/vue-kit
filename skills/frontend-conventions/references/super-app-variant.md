# Super-app variant

Use when one repo hosts several mini apps (CRM, Task, HR, Finance…) behind one shell. Every naming and coding rule in `SKILL.md` still applies; only the structure and a few prefixes change. In an existing super-app repo, its `CLAUDE.md` wins.

## Tree

```
src/
├── main.ts · App.vue
├── router/index.ts              createRouter; spreads every app's routes; global guards
├── pages/                       shell-only pages: login, 404, no-permission
├── components/                  shell + shared UI: ui/, blocks/, layout/
├── composables/                 shared across apps (auto-imported)
├── stores/                      shared across apps: auth, ui, settings
├── types/ · constants/ · utils/ shared across apps
├── apps/
│   └── crm/
│       ├── routes/index.ts      CRM_ROUTE + crmRoutes + CRM permission groups
│       ├── pages/<url>/
│       ├── components/          cards/ forms/ inputs/ pages/<url>/ skeletons/<url>/
│       ├── composables/         + pages/<url>/
│       ├── api/                 <resource>.api.ts
│       ├── stores/              app-only stores
│       ├── schemas/<area>/
│       ├── types/               models/ api/<resource>/ pages/<url>/
│       └── constants/
└── packages/                    (repo root) workspace packages consumed as source
```

## What changes vs the single app

| Concern | Single app | Super app |
|---|---|---|
| App code | `src/<kind>/` | `src/apps/<app>/<kind>/`, same inner layout |
| Shared code | everything is the app | `src/<kind>/` = used by 2+ apps or the shell |
| App types/constants | `src/types/`, `src/constants/` | inside the app: `apps/<app>/types/`, `apps/<app>/constants/` (not `shared/types/apps/<app>/`) |
| Route config | `ROUTE` | `<APP>_ROUTE` per app, `NAME` prefixed `<app>-` (`crm-dashboard`), `PATH` prefixed `/<app>` |
| Route meta | `permissions` | `app: AppName.CRM`, `permissions`, optional `navigationScope` |
| Permission groups | `OPERATIONAL_PERMISSIONS` | per app: `CRM_OPERATIONAL_PERMISSIONS` |
| Component names | `SettingsDialog.vue` | prefix with the app only when a shared folder would collide: `CrmSettingsDialog.vue` |
| HTTP | one backend | one `http` client with `baseUrls: { main, report, … }`; a request picks one with `base: 'report'` |
| Aliases | `@` | `@` only; import apps as `@/apps/<app>/…` (no per-app aliases) |
| Shared packages | the kit | the kit + monorepo `packages/*` workspaces |

## Boundaries

- An app imports from shared (`@/components`, `@/composables`, `@/stores`, `@/types`) and from itself. It never imports from another app.
- The shell never imports from an app. When the shell needs app UI (e.g. a settings dialog), move that component to shared or expose it through a registered slot/route.
- Code used by a second app moves to shared; code used by one app moves into that app.
- Global stores hold cross-app state only. An app's lookup data (predefined values) lives in that app's store, fetched when the app is entered.

## Router

```ts
// src/apps/crm/routes/index.ts
export const CRM_ROUTE = {
  DASHBOARD: { NAME: 'crm-dashboard', PATH: '/crm', PERMISSIONS: CRM_REPORT_PERMISSIONS },
} as const satisfies RouteConfigGroup

export const crmRoutes: RouteRecordRaw[] = [
  { path: CRM_ROUTE.DASHBOARD.PATH, name: CRM_ROUTE.DASHBOARD.NAME,
    component: () => import('@/apps/crm/pages/dashboard/index.vue'),
    meta: { app: AppName.CRM, permissions: CRM_ROUTE.DASHBOARD.PERMISSIONS } },
]

// src/router/index.ts
const routes = [...shellRoutes, ...crmRoutes, ...taskRoutes]
```

## Workflow scoping

To keep a list's filters and paging while the user moves list → detail → edit → list, tag the workflow's routes with a shared `meta.navigationScope` and clear saved table state in `router.afterEach` when navigation leaves the scope. This is portable to single apps too; it only matters more in super apps because each app has several such workflows.
