# 0010. No heavy UI libraries

Status: Accepted (2026-11-11)

## Context

The owner reviewed the input design (Phase 4) and ruled out UI that depends on another package such as DevExtreme or a date picker. The boundary was set to heavy UI libraries only.

## Decision

DevExtreme, `@vuepic/vue-datepicker`, Tiptap, `vue3-colorpicker` and `vue-easy-lightbox` are not used anywhere in vue-kit. That removes DataGrid, the filter pipeline and DX charts (row 15), the rich-text editor (row 17), the lightbox (row 16) and the third-party color picker. Small utilities stay as normal dependencies: `maska`, `@floating-ui/vue`, `tailwind-merge`, `vue-iconsax`. `AppDateInput` uses native date inputs. This withdraws `./data-grid` from ADR-0003.

## Consequences

Picker-only date features (inline calendar, quarter and year pickers, multi-dates, disabled dates greyed out in the popup) are dropped. A consumer that needs them brings its own picker through the override levels. A test fails the build if `src/ui` imports a package outside the allow-list.
