<template>
  <component :is="root" v-bind="{ ...$attrs, ...rootProps }" :class="ui.root">
    <slot :loading="loading" />
  </component>
</template>

<script setup lang="ts">
// Button: a <button>, the app's RouterLink, an <a>, or any element / component via `as`, with
// loading and disabled state. Its look comes from `createVueKit({ ui: { button: { [variant]: … } } })`
// plus your own `class`. The kit's dialogs, toasts and inputs use it too, so everything matches.
import { computed, getCurrentInstance, useAttrs, type Component } from 'vue'
import { useVueKit } from './plugin'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Which look from `ui.button` to use: default, primary, secondary, danger, ghost, or your own. */
    variant?: string
    /** Route location; rendered with the app's RouterLink when registered, else as an <a>. */
    to?: string | Record<string, unknown>
    /** Render another element or component, e.g. `label` for a file picker, or `NuxtLink`. */
    as?: string | Component
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'default' },
)

const attrs = useAttrs()
const kit = useVueKit()
const ui = computed(() => ({ root: kit.ui.button?.[props.variant] }))
const routerLink = getCurrentInstance()?.appContext.components.RouterLink
const root = computed(() => props.as ?? (props.to ? (routerLink ?? 'a') : 'button'))
const blocked = computed(() => props.disabled || props.loading)

const rootProps = computed(() => {
  const state = {
    'aria-busy': props.loading || undefined,
    'data-loading': props.loading ? '' : undefined,
    'data-disabled': blocked.value ? '' : undefined,
  }
  if (root.value === 'button') {
    // The caller's type (e.g. submit) wins; plain buttons never submit a form by accident.
    return {
      ...state,
      type: (attrs.type as string | undefined) ?? 'button',
      disabled: blocked.value,
    }
  }
  // Links and other tags can't be disabled natively; announce it instead.
  const link = props.to
    ? root.value === 'a'
      ? { href: typeof props.to === 'string' ? props.to : undefined }
      : { to: props.to }
    : {}
  return { ...state, ...link, 'aria-disabled': blocked.value ? 'true' : undefined }
})
</script>
