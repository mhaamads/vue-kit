# 12: `AppSelect`

**What to build:** An app developer replaces any portal-iq-vue select with `AppSelect`. A keyboard or screen-reader user can find, choose and remove options. A custom UI gets the same behaviour by binding the trigger, listbox and option props.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** resolved

- [x] Single and multiple selection, search via `v-model:query`, lazy options with a ready flag, selected-chips limit, unselectable options, option descriptions, loading, and a default search text.
- [x] `triggerProps`: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; ↑ ↓ Home End Enter Escape. `listboxProps`: `role="listbox"`, `aria-multiselectable`. `optionProps(o, i)`: `role="option"`, `aria-selected`, id.
- [x] Slots: `trigger`, `option` (with selected state), `no-results-found`, and the full-override default slot.
- [x] The default skin positions with `@floating-ui/vue` and virtualises long lists. A test with 5,000 options renders a bounded number of option nodes. **Changed:** the windowing is about 20 lines in the skin instead of `vue-virtual-scroller`. Options have a fixed height, and that library imports a CSS file that would not reach consumers through the library build.
- [x] All three contract UIs pass, and the `Select` global override key works.

## Notes (resolved 2026-11-12)

- Not teleported: inside the kit's modal `<dialog>`, a body-level list would render behind the top layer and be inert. floating-ui uses `strategy: 'fixed'` instead.
- Closes on the trigger's `blur`, not on a document-wide outside-click listener. Options and the dropdown container (`popupProps`) prevent `mousedown`, so clicking a row or dragging the scrollbar keeps focus (the scrollbar case was found in review).
- One highlight index over the filtered list, skipping disabled options. Portal indexed the enabled list but painted the filtered one, so the highlight sat on the wrong row whenever a disabled option came before it.
- A searchable select is one `<input role="combobox">`: it shows the selection when closed and the query when open. Portal swapped between a div and an input. A click on it only opens (found in review: toggling closed the list while the user was searching).
- Kept from portal: `optionsUnselectable` (default true), multiple stays open, search across every option field, lazy open-when-ready, loose matching, and the `trigger` / `option` / `no-results-found` slots.
- Dropped (no consumers yet): `selectionChip`, `minDropdownWidth` (fixed 150 px), `useLargestOptionWidth` (canvas text measuring), `optionHasDescription` (automatic), `classList`. Chips with `selectedOptionsLimit` sit above the trigger with a `+N` badge and an sr-only "N more selected".
- `vue-virtual-scroller` stays on the ADR-0011 allow-list but is not installed.
