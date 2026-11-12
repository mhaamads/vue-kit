# AI coding skill

`frontend-conventions` teaches Claude Code how to write Vue 3 apps: names, folders, components, API
calls, forms, styling, and what not to do. In projects that use vue-kit it also says how to use the
kit; projects without the kit follow the same rules with their own components.

It lives in this repo on GitHub, in
[`skills/frontend-conventions`](https://github.com/mhaamads/vue-kit/tree/main/skills/frontend-conventions).

## Install in an app

Run in your app's folder:

```sh
npx skills add mhaamads/vue-kit --skill frontend-conventions
```

It goes into `.claude/skills/frontend-conventions`. Commit that folder (and `skills-lock.json`) so
everyone on the team gets it.

## Install for every project on your machine

```sh
npx skills add mhaamads/vue-kit --skill frontend-conventions -g
```

## Update

```sh
npx skills update
```

This pulls the latest version from GitHub.

## What's inside

| File                                                                                                                                | What                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`SKILL.md`](https://github.com/mhaamads/vue-kit/blob/main/skills/frontend-conventions/SKILL.md)                                    | Naming, coding rules, the kit, dialogs, Do / Don't  |
| [`folder-structure.md`](https://github.com/mhaamads/vue-kit/blob/main/skills/frontend-conventions/references/folder-structure.md)   | Where every kind of file goes, and the kit's setup  |
| [`examples.md`](https://github.com/mhaamads/vue-kit/blob/main/skills/frontend-conventions/references/examples.md)                   | An API file, component, dialog, schema, form, store |
| [`super-app-variant.md`](https://github.com/mhaamads/vue-kit/blob/main/skills/frontend-conventions/references/super-app-variant.md) | One repo with several mini apps                     |

## Change the rules

Edit the files in `skills/frontend-conventions/` and push to `main`. Apps get the change with
`npx skills update`.
