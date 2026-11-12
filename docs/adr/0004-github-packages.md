# 0004. Private repo, published to GitHub Packages

Status: Accepted (2026-11-11)

## Context

The org already hosts Portal.IQ.Vue on GitHub.

## Decision

The repo is `mhaamads/vue-kit` (private), and the package is published to `npm.pkg.github.com`. The local clone is `~/Documents/GitHub/portal/vue-kit`.

## Consequences

Consumers add `@mhaamads:registry=https://npm.pkg.github.com` to `.npmrc` and use a token with `read:packages`. The GitHub repo is created only after a separate go-ahead.
