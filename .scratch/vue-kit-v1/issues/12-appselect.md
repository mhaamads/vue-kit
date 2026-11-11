# 12: `AppSelect`

**What to build:** An app developer replaces any portal-iq-vue select with `AppSelect`. A keyboard or screen-reader user can find, choose and remove options. A custom UI gets the same behaviour by binding the trigger, listbox and option props.

**Blocked by:** 08 (`useField`, basic `AppInput` and the contract harness).

**Status:** ready-for-agent

- [ ] Single and multiple selection, search via `v-model:query`, lazy options with a ready flag, selected-chips limit, unselectable options, option descriptions, loading, and a default search text.
- [ ] `triggerProps`: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; ↑ ↓ Home End Enter Escape. `listboxProps`: `role="listbox"`, `aria-multiselectable`. `optionProps(o, i)`: `role="option"`, `aria-selected`, id.
- [ ] Slots: `trigger`, `option` (with selected state), `no-results-found`, and the full-override default slot.
- [ ] The default skin positions with `@floating-ui/vue` and virtualises long lists with `vue-virtual-scroller`. A test with 5,000 options renders a bounded number of option nodes.
- [ ] All three contract UIs pass, and the `Select` global override key works.
