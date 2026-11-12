<template>
  <slot v-if="$slots.default" v-bind="field" />
  <component :is="override" v-else-if="override" :field="field">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </component>
  <AppSelectSkin
    v-else
    :field="field"
    :root-class="rootClass"
    :show-selected-options="showSelectedOptions"
    :selected-options-limit="selectedOptionsLimit"
    :option-height="optionHeight"
    :trigger-icon="triggerIcon"
  >
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </AppSelectSkin>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { IconName } from '../icon-names'
import { useVueKit } from '../plugin'
import AppSelectSkin from './AppSelectSkin.vue'
import { useSelect, type SelectOption } from './use-select'

// Same precedence as AppInput: instance default slot > app-wide override > default skin.
const props = withDefaults(
  defineProps<{
    options?: SelectOption[]
    id?: string
    label?: string
    hint?: string
    errors?: string[]
    placeholder?: string
    multiple?: boolean
    searchable?: boolean
    optionsUnselectable?: boolean
    loading?: boolean
    lazy?: boolean
    isOptionsReady?: boolean
    defaultSearchText?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    // Default skin only:
    rootClass?: string
    showSelectedOptions?: boolean
    selectedOptionsLimit?: number
    optionHeight?: number
    triggerIcon?: IconName
  }>(),
  { searchable: true, optionsUnselectable: true, showSelectedOptions: true },
)
const emit = defineEmits<{ 'load-options': [] }>()
const model = defineModel<unknown>()
const query = defineModel<string>('query', { default: '' })

const field = reactive(
  useSelect({
    model,
    query,
    options: () => props.options,
    id: () => props.id,
    label: () => props.label,
    hint: () => props.hint,
    errors: () => props.errors,
    placeholder: () => props.placeholder,
    multiple: () => props.multiple,
    searchable: () => props.searchable,
    optionsUnselectable: () => props.optionsUnselectable,
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

const override = useVueKit().components.Select
</script>
