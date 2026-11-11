<template>
  <dialog
    ref="dialog"
    v-bind="dialogProps"
    :aria-labelledby="labelledBy()"
    class="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/20 not-open:hidden dark:backdrop:bg-black/70"
  >
    <div
      v-if="open"
      class="fixed top-0 flex h-dvh w-full flex-col bg-white shadow-lg transition-transform duration-300 dark:bg-base-neutral-800"
      :class="panelClass"
      :style="{ maxWidth: width }"
    >
      <AppOverlayHeading :title="title" :sticky="stickyHeading">
        <template #header-end><slot name="header-end" /></template>
      </AppOverlayHeading>
      <slot />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppOverlayHeading from './AppOverlayHeading.vue'
import { useModalDialog } from './overlay'

const {
  position = 'end',
  width = '560px',
  closeOnEscape = true,
  closeOnBackdrop = true,
} = defineProps<{
  title?: string
  /** Side the drawer opens from; logical, so `end` is the left edge in RTL. */
  position?: 'start' | 'end'
  width?: string
  stickyHeading?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}>()
const open = defineModel<boolean>({ default: false })

const { dialog, dialogProps, labelledBy } = useModalDialog(open, {
  closeOnEscape: () => closeOnEscape,
  closeOnBackdrop: () => closeOnBackdrop,
})

// Slides in from its own edge, mirrored in RTL.
const panelClass = computed(() =>
  position === 'start'
    ? 'start-0 rounded-e-3xl starting:-translate-x-full rtl:starting:translate-x-full'
    : 'end-0 rounded-s-3xl starting:translate-x-full rtl:starting:-translate-x-full',
)
</script>
