<template>
  <div :class="rootMerged">
    <label v-if="field.label" v-bind="field.labelProps" :class="labelClass">
      {{ field.label
      }}<span v-if="field.required" class="text-red-500" aria-hidden="true">&nbsp;*</span>
    </label>

    <div
      v-if="field.multiple && showSelectedOptions && field.hasValue"
      class="mb-2 flex flex-wrap gap-2"
    >
      <span v-for="option in shownChips" :key="String(option.value)" :class="chipClass">
        <span class="max-w-50 truncate">{{ option.label }}</span>
        <button
          v-bind="field.removeProps(option)"
          type="button"
          class="shrink-0 rounded text-primary-red-700 disabled:opacity-50"
        >
          <AppIcon name="CloseCircle" :size="14" />
        </button>
      </span>
      <span
        v-if="hiddenChips.length"
        :title="hiddenChips.map((o) => o.label).join('\n')"
        class="flex h-7.5 items-center rounded-lg bg-primary-orange-500 px-2 text-xs text-white"
      >
        +{{ hiddenChips.length
        }}<span class="sr-only">{{ messages.moreSelected(hiddenChips.length) }}</span>
      </span>
    </div>

    <div ref="anchor" class="relative">
      <slot name="trigger" v-bind="field">
        <input v-if="field.searchable" v-bind="field.triggerProps" :class="triggerClass" />
        <div
          v-else
          v-bind="field.triggerProps"
          class="flex cursor-pointer items-center"
          :class="triggerClass"
        >
          <span
            class="truncate"
            :class="field.hasValue && !field.multiple ? '' : 'text-base-neutral-300'"
          >
            {{ field.displayText }}
          </span>
        </div>
      </slot>
      <span
        class="pointer-events-none absolute inset-y-0 end-2 flex items-center text-primary-orange-500"
        aria-hidden="true"
      >
        <svg v-if="field.loading" class="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <AppIcon
          v-else
          :name="triggerIcon ?? 'ArrowDown2'"
          :size="18"
          class="transition-transform"
          :class="field.open ? 'rotate-180' : ''"
        />
      </span>

      <!-- No teleport: inside a modal <dialog> a body-level list would sit behind it, inert. -->
      <div
        v-if="field.open"
        ref="floating"
        v-bind="field.popupProps"
        :style="floatingStyles"
        class="z-dropdown-6 overflow-hidden rounded-lg border border-neutral-default bg-surface-100 shadow-lg"
      >
        <div
          v-if="field.filteredOptions.length"
          ref="scroller"
          class="overflow-y-auto"
          :style="{ height: `${viewport}px` }"
          @scroll="onScroll"
        >
          <ul
            v-bind="field.listboxProps"
            class="relative"
            :style="{ height: `${field.filteredOptions.length * rowHeight}px` }"
          >
            <li
              v-for="{ option, index } in visible"
              :key="index"
              v-bind="field.optionProps(option, index)"
              class="absolute inset-x-0 flex items-center justify-between gap-2 border-b border-neutral-default px-3 text-sm data-active:bg-base-neutral-100/30 dark:data-active:bg-surface-200"
              :class="option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
              :style="{ top: `${index * rowHeight}px`, height: `${rowHeight}px` }"
            >
              <slot
                name="option"
                :option="option"
                :is-selected="field.isSelected(option)"
                :select="field.select"
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate">{{ option.label }}</span>
                  <span
                    v-if="option.description"
                    class="block truncate text-xs text-base-neutral-400"
                    >{{ option.description }}</span
                  >
                </span>
                <AppIcon
                  v-if="field.isSelected(option)"
                  name="TickCircle"
                  :size="20"
                  class="shrink-0 icon-primary-orange-500"
                />
              </slot>
            </li>
          </ul>
        </div>
        <div v-else class="p-3 text-sm text-base-neutral-500" role="status">
          <slot name="no-results-found" v-bind="field">{{ field.emptyText }}</slot>
        </div>
      </div>
    </div>
    <FieldFeedback :field="field" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { autoUpdate, flip, offset, size, useFloating } from '@floating-ui/vue'
import { twMerge } from 'tailwind-merge'
import AppIcon from '../AppIcon.vue'
import type { IconName } from '../icon-names'
import { useVueKit } from '../plugin'
import FieldFeedback from './FieldFeedback.vue'
import type { SelectField } from './use-select'

// The default look of AppSelect (ported from portal-iq-vue Select.vue).
const props = defineProps<{
  field: SelectField
  rootClass?: string
  showSelectedOptions?: boolean
  selectedOptionsLimit?: number
  optionHeight?: number
  triggerIcon?: IconName
}>()

const { messages } = useVueKit()
const labelClass = 'mb-2 flex text-sm font-medium capitalize dark:text-white'
const chipClass =
  'flex h-7.5 items-center gap-1 rounded-lg border border-neutral-default bg-surface-100 ps-2 pe-1 text-xs text-base-neutral-600 dark:text-base-neutral-200'
const rootMerged = computed(() => twMerge('w-full', props.rootClass))
const triggerClass =
  'h-10 w-full rounded-xl border border-neutral-input bg-surface-100 ps-3 pe-9 text-sm outline-none transition-all duration-300 not-focus:hover:border-base-neutral-400 focus:border-primary-red-700 aria-invalid:border-app-error disabled:input-disabled aria-disabled:input-disabled dark:not-focus:hover:border-base-neutral-600'

const shownChips = computed(() =>
  props.selectedOptionsLimit
    ? props.field.selectedOptions.slice(0, props.selectedOptionsLimit)
    : props.field.selectedOptions,
)
const hiddenChips = computed(() => props.field.selectedOptions.slice(shownChips.value.length))

const anchor = useTemplateRef<HTMLElement>('anchor')
const floating = useTemplateRef<HTMLElement>('floating')
const { floatingStyles } = useFloating(anchor, floating, {
  // Fixed, not teleported: escapes overflow clipping and stays inside a modal dialog's top layer.
  strategy: 'fixed',
  placement: 'bottom-start',
  middleware: [
    offset(5),
    flip({ padding: 8 }),
    size({
      apply: ({ rects, elements }) => {
        Object.assign(elements.floating.style, {
          width: `${rects.reference.width}px`,
          minWidth: '150px',
        })
      },
    }),
  ],
  whileElementsMounted: autoUpdate,
})

// Fixed-height windowing: only the rows in view (plus a few) are in the DOM, so long lists stay fast.
const MAX_HEIGHT = 240
const BUFFER = 4
const rowHeight = computed(() => props.optionHeight ?? 48)
const viewport = computed(() =>
  Math.min(props.field.filteredOptions.length * rowHeight.value, MAX_HEIGHT),
)
const scrollTop = ref(0)
const scroller = useTemplateRef<HTMLElement>('scroller')
const onScroll = () => (scrollTop.value = scroller.value?.scrollTop ?? 0)

const visible = computed(() => {
  const first = Math.max(0, Math.floor(scrollTop.value / rowHeight.value) - BUFFER)
  const count = Math.ceil(MAX_HEIGHT / rowHeight.value) + BUFFER * 2
  return props.field.filteredOptions
    .slice(first, first + count)
    .map((option, i) => ({ option, index: first + i }))
})

watch(
  () => props.field.filteredOptions,
  () => (scrollTop.value = 0),
)

// Keep the keyboard highlight in view.
watch(
  () => props.field.activeIndex,
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
