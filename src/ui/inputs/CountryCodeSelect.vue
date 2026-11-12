<template>
  <div ref="anchor" data-country :data-open="field.open ? '' : undefined" :class="ui.country">
    <input
      v-bind="field.triggerProps"
      :aria-label="messages.countryCode"
      :class="ui.countryTrigger"
    />
    <div
      v-if="field.open"
      ref="menu"
      v-bind="field.popupProps"
      data-country-menu
      :style="floatingStyles"
      :class="ui.countryMenu"
    >
      <ul
        v-if="field.filteredOptions.length"
        v-bind="field.listboxProps"
        :style="{ maxHeight: '240px', overflowY: 'auto', margin: 0, padding: 0 }"
      >
        <li
          v-for="(option, index) in field.filteredOptions"
          :key="`${option.iso}${option.value}`"
          v-bind="field.optionProps(option, index)"
          :data-selected="field.isSelected(option) ? '' : undefined"
          :class="ui.countryOption"
        >
          <!-- The spaces come from the text, so the parts stay apart even without CSS. -->
          <span>{{ `${option.iso} ` }}</span
          ><span dir="ltr">{{ `${option.value} ` }}</span>
          <small>{{ option.name }}</small>
        </li>
      </ul>
      <div v-else role="status">{{ field.emptyText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// The dial-code picker inside AppInput type="tel", like portal's: shows "+964 ▾"; type a country
// name (English or local), ISO code or number to search. Built on useSelect, so the keyboard and
// screen-reader behaviour is the select's.
import { nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import { useVueKit } from '../plugin'
import type { InputUi } from '../ui'
import { countries } from './countries'
import { useDropdown } from './use-dropdown'
import { useSelect } from './use-select'

const props = defineProps<{ id: string; disabled?: boolean; ui: InputUi }>()
const code = defineModel<string>()

const { messages } = useVueKit()
// Every field of an option is searched: dial code, ISO code, English and local name.
const options = countries.map(([iso, dial, name, localName]) => ({
  label: dial,
  value: dial,
  iso,
  name,
  localName,
}))

const query = ref('')
const field = reactive(
  useSelect({
    model: code,
    query,
    options,
    id: () => props.id,
    placeholder: '+',
    disabled: () => props.disabled,
    optionsUnselectable: false,
  }),
)

const anchor = useTemplateRef<HTMLElement>('anchor')
const menu = useTemplateRef<HTMLElement>('menu')
const { floatingStyles } = useDropdown(anchor, menu, { match: false, minWidth: 240 })

// Open on the chosen country instead of the top of the list.
watch(
  () => field.open,
  async (open) => {
    if (!open) return
    await nextTick()
    menu.value?.querySelector('[data-selected]')?.scrollIntoView?.({ block: 'nearest' })
  },
)
</script>
