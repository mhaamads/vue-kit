# 0009. SemVer with manual releases

Status: Accepted (2026-11-11)

## Context

There is one package (ADR-0003).

## Decision

Versions stay at `0.x` while porting, and `1.0.0` comes when ADR-0005 is complete. A breaking change is a major version. Anything being removed first shows a dev-only `console.warn` for at least one minor. A release is `npm version`, a hand-written `CHANGELOG.md`, and a GitHub Action that publishes on a version tag.

## Consequences

No release tool is needed. Add Changesets if the package ever splits.
