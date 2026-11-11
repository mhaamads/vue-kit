<template>
  <component
    :is="root"
    v-bind="{ ...restAttrs, ...rootProps }"
    :class="mergedClass"
    :aria-busy="loading || undefined"
  >
    <template v-if="loading">
      <svg class="mx-auto size-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      <span class="sr-only">{{ messages.loading }}</span>
    </template>
    <template v-else>
      <slot name="before" />
      <AppIcon
        v-if="icon"
        :name="icon"
        :size="iconSize"
        :color="iconConfig?.color"
        :type="iconConfig?.type"
        :class="iconClass"
      />
      <span v-if="text">{{ text }}</span>
      <slot />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, useSlots } from 'vue'
import AppIcon from './AppIcon.vue'
import type { IconName } from './icon-names'
import { useMergedClass } from './merge-class'
import { useVueKit } from './plugin'
import {
  buttonActiveClasses,
  buttonIconSizes,
  buttonRadiusClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  type ButtonRadius,
  type ButtonSize,
  type ButtonVariant,
  type IconType,
} from './styles'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Route location; rendered with the app's RouterLink when registered, else as an <a>. */
    to?: string | Record<string, unknown>
    /** Render as another element, e.g. `label` for a file picker or `div` inside another control. */
    tag?: string
    text?: string
    variant?: ButtonVariant
    size?: ButtonSize
    radius?: ButtonRadius
    aspect?: 'square' | 'auto'
    icon?: IconName
    iconPosition?: 'start' | 'end'
    iconConfig?: { color?: string; size?: number | string; type?: IconType }
    loading?: boolean
    disabled?: boolean
    active?: boolean
  }>(),
  { variant: 'primary', size: '48', radius: '12', iconPosition: 'start' },
)

const { messages } = useVueKit()
const routerLink = getCurrentInstance()?.appContext.components.RouterLink
const slots = useSlots()

// The icon is aria-hidden, so an icon-only button needs a name of its own.
onMounted(() => {
  if (process.env.NODE_ENV === 'production' || props.text || slots.default) return
  const named = ['aria-label', 'aria-labelledby', 'title'].some((key) => restAttrs.value[key])
  if (!named) console.warn('[vue-kit] AppButton without text needs an aria-label.', props.icon)
})

const root = computed(() => props.tag ?? (props.to ? (routerLink ?? 'a') : 'button'))
const blocked = computed(() => props.disabled || props.loading)

const rootProps = computed(() => {
  if (root.value === 'button') {
    return {
      type: (restAttrs.value.type as string | undefined) ?? 'button',
      disabled: blocked.value,
    }
  }
  // Links and other tags can't be disabled natively; announce it instead.
  const link = props.to
    ? root.value === 'a'
      ? { href: typeof props.to === 'string' ? props.to : undefined }
      : { to: props.to }
    : {}
  return { ...link, 'aria-disabled': blocked.value ? 'true' : undefined }
})

const { mergedClass, restAttrs } = useMergedClass(() =>
  [
    buttonVariantClasses[props.variant],
    buttonSizeClasses[props.size],
    buttonRadiusClasses[props.radius],
    'font-poppins font-medium flex items-center group whitespace-nowrap cursor-pointer transition-all **:transition-all duration-400 **:duration-400',
    props.aspect === 'square' ? 'aspect-square p-0' : '',
    props.icon && props.iconPosition === 'end' ? 'flex-row-reverse' : '',
    props.active ? buttonActiveClasses[props.variant] : '',
  ].join(' '),
)

const iconSize = computed(() => props.iconConfig?.size ?? buttonIconSizes[props.size] ?? 20)

const iconClass = computed(() => {
  if (!props.text) return 'shrink-0'
  return props.iconPosition === 'start' ? 'shrink-0 me-2' : 'shrink-0 ms-2'
})
</script>
