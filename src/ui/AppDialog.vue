<template>
  <dialog
    ref="dialog"
    v-bind="dialogProps"
    :aria-labelledby="labelledBy()"
    class="m-0 flex h-dvh max-h-none w-screen max-w-none overflow-auto bg-transparent opacity-100 transition-all transition-discrete duration-200 backdrop:bg-black/20 not-open:hidden starting:opacity-0 dark:backdrop:bg-black/70"
    :class="fullscreen ? 'p-0' : 'p-4'"
  >
    <!-- Content is centred; clicks on the empty area around it close the dialog. -->
    <div v-if="open" class="m-auto">
      <slot />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useModalDialog } from './overlay'

const { closeOnEscape = true, closeOnBackdrop = true } = defineProps<{
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  fullscreen?: boolean
}>()
const open = defineModel<boolean>({ default: false })

const { dialog, dialogProps, labelledBy } = useModalDialog(open, {
  closeOnEscape: () => closeOnEscape,
  closeOnBackdrop: () => closeOnBackdrop,
})
</script>
