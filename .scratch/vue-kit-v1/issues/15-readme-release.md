# 15: README and release workflow

**What to build:** A developer on a new app can install, set up and customise vue-kit from the README alone. A maintainer can release by running `npm version`, adding a CHANGELOG entry and pushing the tag.

**Blocked by:** 06 (HTTP client), 07 (Dialog, Drawer and overlay heading), 09 (`AppInput` full feature set), 10 (`AppForm`), 11 (Choice inputs), 12 (`AppSelect`), 13 (`AppDateInput`), 14 (`AppTimeInput`).

**Status:** ready-for-agent

- [ ] README: registry `.npmrc` line and token scope, install, `createVueKit` options, the `theme.css` + `@source` setup, token overrides, dark mode, RTL, `messages`, `createHttpClient` with an auth example, and a worked example for every override level.
- [ ] README shows a phone-number check through the `custom` rule (for example with the app's own `libphonenumber-js`). vue-kit does not ship `isPhone` (ADR-0011, ticket 02).
- [ ] Every README code example is copied from a test or the smoke fixture, so it compiles.
- [ ] A GitHub Action publishes to GitHub Packages when a version tag is pushed, after the full CI passes.
- [ ] `CHANGELOG.md` has a `0.1.0` entry. The deprecation policy is written down (ADR-0009).
- [ ] Creating `MoonlineTravel/vue-kit`, adding the remote and the first publish are **not** done here. They need the owner's go-ahead (ADR-0004).
