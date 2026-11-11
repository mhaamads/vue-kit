<template>
  <header
    class="flex h-16 min-h-16 items-center justify-between border-b border-neutral-default px-5"
    :class="sticky ? 'sticky top-0 z-1 rounded-ss-3xl bg-white dark:bg-base-neutral-800' : ''"
  >
    <div class="flex items-center gap-4">
      <AppButton
        v-if="closeable"
        variant="outline"
        aspect="square"
        size="36"
        radius="full"
        icon="ArrowLeft2"
        class="rtl:rotate-180"
        :aria-label="messages.close"
        @click="close"
      />
      <AppText :id="context?.titleId" tag="h2" size="16" weight="semibold">{{ title }}</AppText>
      <slot name="title-end" />
    </div>
    <slot name="header-end" />
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import AppButton from './AppButton.vue'
import AppText from './AppText.vue'
import { useOverlayContext } from './overlay'
import { useVueKit } from './plugin'

const { closeable = true, sticky = false } = defineProps<{
  title?: string
  closeable?: boolean
  sticky?: boolean
}>()
const emit = defineEmits<{ close: [] }>()

const { messages } = useVueKit()
const context = useOverlayContext()

// Inside AppDialog / AppDrawer the title names the dialog (aria-labelledby).
if (context) context.hasTitle.value = true
onBeforeUnmount(() => {
  if (context) context.hasTitle.value = false
})

const close = () => {
  emit('close')
  context?.close()
}
</script>
