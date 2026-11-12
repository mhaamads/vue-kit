<template>
  <div v-bind="field.dataAttrs" :data-open="field.open ? '' : undefined" :class="ui.root">
    <label v-if="field.label || $slots.label" v-bind="field.labelProps" :class="ui.label">
      <slot name="label" :label="field.label">{{ field.label }}</slot>
    </label>

    <ul v-if="field.multiple && showSelectedOptions && field.hasValue" data-chips :class="ui.chips">
      <li v-for="option in shownChips" :key="String(option.value)" data-chip :class="ui.chip">
        <slot name="chip" :option="option">{{ option.label }}</slot>
        <AppButton v-bind="field.removeProps(option)" variant="ghost" :class="ui.chipRemove">
          ×
        </AppButton>
      </li>
      <li
        v-if="hiddenChips.length"
        data-chip-more
        :title="hiddenChips.map((o) => o.label).join('\n')"
        :class="ui.chipMore"
      >
        {{ messages.moreSelected(hiddenChips.length) }}
      </li>
    </ul>

    <div ref="anchor" :class="ui.control">
      <span v-if="$slots.leading" data-leading :class="ui.leading">
        <slot name="leading" :field="field" />
      </span>
      <input v-if="field.searchable" v-bind="field.triggerProps" :class="ui.trigger" />
      <div v-else v-bind="field.triggerProps" :class="ui.trigger">{{ field.displayText }}</div>
      <span v-if="$slots.trailing" data-trailing :class="ui.trailing">
        <slot name="trailing" :field="field" />
      </span>

      <div
        v-if="field.open"
        ref="floating"
        v-bind="field.popupProps"
        data-select-content
        :style="floatingStyles"
        :class="ui.content"
      >
        <div
          v-if="field.filteredOptions.length"
          ref="scroller"
          :style="{ height: `${viewport}px`, overflowY: 'auto' }"
          @scroll="onScroll"
        >
          <ul
            v-bind="field.listboxProps"
            :style="{ position: 'relative', height: `${total}px`, margin: 0, padding: 0 }"
          >
            <li
              v-for="{ option, index } in visible"
              :key="index"
              v-bind="field.optionProps(option, index)"
              :data-selected="field.isSelected(option) ? '' : undefined"
              :data-disabled="field.isOptionDisabled(option) ? '' : undefined"
              :style="rowStyle(index)"
              :class="ui.option"
            >
              <slot name="option" :option="option" :selected="field.isSelected(option)">
                {{ option.label }}
                <small v-if="option.description" :class="ui.optionDescription">
                  {{ option.description }}
                </small>
              </slot>
            </li>
          </ul>
        </div>
        <div v-else role="status" data-select-empty :class="ui.empty">
          <slot name="empty" :text="field.emptyText" :query="field.query">{{
            field.emptyText
          }}</slot>
        </div>
      </div>
    </div>
    <FieldFeedback :field="field" :ui="ui">
      <template v-if="$slots.hint" #hint="s"><slot name="hint" v-bind="s" /></template>
      <template v-if="$slots.errors" #errors="s"><slot name="errors" v-bind="s" /></template>
    </FieldFeedback>
  </div>
</template>

<script setup lang="ts" generic="V = unknown">
// Select: combobox + listbox with search, multiple (chips), lazy options and keyboard. The inline
// styles are behaviour: floating-ui positioning (fixed, no teleport, so it works inside a modal
// <dialog>) and fixed-height windowing, so 5,000 options stay fast. Slots: `leading` / `trailing`
// (get `field`, e.g. `field.select`, `field.open`), `option` (get `option`, `selected`).
import { computed, reactive, ref, useSlots, useTemplateRef, watch, type Ref } from 'vue'
import { useVueKit } from '../plugin'
import AppButton from '../AppButton.vue'
import { useUi, type SelectUi } from '../ui'
import FieldFeedback from './FieldFeedback.vue'
import { useDropdown } from './use-dropdown'
import { useSelect, type SelectOption } from './use-select'

const props = withDefaults(
  defineProps<{
    /** `{ label, value, description?, disabled? }`; v-model holds the values' type. */
    options?: SelectOption<V>[]
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    /** Shown while nothing is selected. Defaults to "Select option(s)" from messages. */
    placeholder?: string
    multiple?: boolean
    /** Type to filter; every field of an option is searched. */
    searchable?: boolean
    /** Choosing the selected option again clears it. */
    optionsUnselectable?: boolean
    /** Multiple: at most this many picks; the other options are disabled until one is removed. */
    maxValues?: number
    loading?: boolean
    /** Emit `load-options` on first open, and open once `is-options-ready` turns true. */
    lazy?: boolean
    isOptionsReady?: boolean
    /** Shown in an empty list before the user has typed. */
    defaultSearchText?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Multiple: show the selected options as removable chips. */
    showSelectedOptions?: boolean
    /** Multiple: show at most this many chips, then "N more selected". */
    selectedOptionsLimit?: number
    /** Row height in px for the windowing; every option must render at this height. Default 48. */
    optionHeight?: number
    /** Classes per piece; wins over `createVueKit({ ui: { select } })`. */
    ui?: SelectUi
  }>(),
  { searchable: true, optionsUnselectable: true, showSelectedOptions: true },
)
const emit = defineEmits<{ 'load-options': [] }>()
/** The picked value, or the picked values with `multiple`. */
const model = defineModel<V | V[] | null>()
const query = defineModel<string>('query', { default: '' })

const slots = useSlots()
const field = reactive(
  useSelect({
    model: model as Ref<unknown>,
    query,
    options: () => props.options,
    id: () => props.id,
    hasHint: () => !!slots.hint,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    placeholder: () => props.placeholder,
    multiple: () => props.multiple,
    searchable: () => props.searchable,
    optionsUnselectable: () => props.optionsUnselectable,
    maxValues: () => props.maxValues,
    loading: () => props.loading,
    lazy: () => props.lazy,
    isOptionsReady: () => props.isOptionsReady,
    defaultSearchText: () => props.defaultSearchText,
    required: () => props.required,
    disabled: () => props.disabled,
    readonly: () => props.readonly,
    onLoadOptions: () => emit('load-options'),
  }),
)
const ui = useUi('select', () => props.ui)
const { messages } = useVueKit()

const shownChips = computed(() =>
  props.selectedOptionsLimit
    ? field.selectedOptions.slice(0, props.selectedOptionsLimit)
    : field.selectedOptions,
)
const hiddenChips = computed(() => field.selectedOptions.slice(shownChips.value.length))

const anchor = useTemplateRef<HTMLElement>('anchor')
const floating = useTemplateRef<HTMLElement>('floating')
const { floatingStyles } = useDropdown(anchor, floating)

// Fixed-height windowing: only the rows in view (plus a few) are in the DOM.
const MAX_HEIGHT = 240
const BUFFER = 4
const rowHeight = computed(() => props.optionHeight ?? 48)
const total = computed(() => field.filteredOptions.length * rowHeight.value)
const viewport = computed(() => Math.min(total.value, MAX_HEIGHT))
const scrollTop = ref(0)
const scroller = useTemplateRef<HTMLElement>('scroller')
const onScroll = () => (scrollTop.value = scroller.value?.scrollTop ?? 0)
const rowStyle = (index: number) => ({
  position: 'absolute' as const,
  insetInline: 0,
  top: `${index * rowHeight.value}px`,
  height: `${rowHeight.value}px`,
})

const visible = computed(() => {
  const first = Math.max(0, Math.floor(scrollTop.value / rowHeight.value) - BUFFER)
  const count = Math.ceil(MAX_HEIGHT / rowHeight.value) + BUFFER * 2
  return field.filteredOptions
    .slice(first, first + count)
    .map((option, i) => ({ option, index: first + i }))
})

watch(
  () => field.filteredOptions,
  () => (scrollTop.value = 0),
)

// Keep the keyboard highlight in view.
watch(
  () => field.activeIndex,
  (index) => {
    const el = scroller.value
    if (!el || index < 0) return
    const top = index * rowHeight.value
    if (top < el.scrollTop) el.scrollTop = top
    else if (top + rowHeight.value > el.scrollTop + viewport.value)
      el.scrollTop = top + rowHeight.value - viewport.value
    onScroll()
  },
)
</script>
