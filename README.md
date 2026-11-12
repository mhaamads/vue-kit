# @mhaamads/vue-kit

Form inputs, dialogs, toasts, validation, date helpers and an HTTP client for Vue 3
apps. Components work out of the box and ship **no CSS**: your app gives them classes, once.

**Docs:** https://mhaamads.github.io/vue-kit/ (or `npm run docs` locally). Start with _Getting started_.

**AI coding skill:** `skills/frontend-conventions` teaches Claude Code the conventions for apps built on
the kit. Install it from GitHub: `npx skills add mhaamads/vue-kit --skill frontend-conventions`.

## Install

```sh
# .npmrc
@mhaamads:registry=https://npm.pkg.github.com

npm install @mhaamads/vue-kit
```

## Use

```ts
// main.ts
import { createApp } from 'vue'
import { createVueKit } from '@mhaamads/vue-kit/ui'
import '@vuepic/vue-datepicker/dist/main.css' // only if you use AppDateInput

createApp(App).use(createVueKit()).mount('#app')
```

```vue
<AppSelect v-model="city" label="City" :options="cities" />
```

| Import                          | What                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@mhaamads/vue-kit/ui`    | Inputs (text, select, checkbox, switch, groups, date, time, PIN), form, button, dialog, toasts, confirm |
| `@mhaamads/vue-kit/utils` | Validation (`defineSchema`, `validate`), date formatting, colours, event bus                            |
| `@mhaamads/vue-kit/http`  | `createHttpClient`: fetch with auth headers, toasts, cancel and timeout                                 |

Works in plain Vue 3.5+ and in Nuxt (server rendering included).

## Develop

```sh
npm install
npm test            # unit tests
npm run type-check
npm run lint
npm run smoke       # build, pack, install into a sample app, test it there
npm run docs        # docs site with live examples
```

Decisions are recorded in `docs/adr/`. Changes per version are in `CHANGELOG.md`.

## Release

1. Update `CHANGELOG.md` and the `version` in `package.json` (SemVer, ADR-0009).
2. Commit, then tag: `git tag v0.1.0 && git push --tags`.
3. The _Release_ workflow checks everything and publishes to GitHub Packages.
