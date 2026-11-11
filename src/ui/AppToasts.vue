<template>
  <section
    :aria-label="messages.notifications"
    aria-live="polite"
    class="fixed inset-x-0 top-10 z-toasts mx-auto flex w-full max-w-135 flex-col gap-2 px-4"
  >
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-out"
      move-class="transition-transform duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :role="toast.type === 'error' ? 'alert' : undefined"
        class="relative flex w-full gap-2.5 overflow-hidden rounded-xl border border-neutral-default bg-white p-4 dark:bg-base-neutral-800"
        :class="toast.action ? 'cursor-pointer' : ''"
        @click="toast.action && run(toast)"
      >
        <div
          class="flex aspect-square h-10 min-w-10 items-center justify-center rounded-xl"
          :class="kinds[toast.type].tile"
        >
          <AppIcon :name="kinds[toast.type].icon" :size="20" color="white" />
        </div>
        <div
          class="min-w-0 flex-1 text-sm leading-5 text-base-neutral-800 dark:text-base-neutral-100"
        >
          <ul v-if="Array.isArray(toast.message)" class="list-disc ps-5">
            <li v-for="(line, i) in toast.message" :key="i">{{ line }}</li>
          </ul>
          <p v-else class="whitespace-pre-line">{{ toast.message }}</p>
          <div class="flex gap-2">
            <button
              v-if="toast.type === 'error'"
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-app-error hover:bg-app-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-app-red-800/30"
              @click.stop="copy(toast)"
            >
              <AppIcon :name="copiedId === toast.id ? 'CopySuccess' : 'Copy'" :size="16" />
              {{ copiedId === toast.id ? messages.copied : messages.copy }}
            </button>
            <button
              v-if="toast.action"
              type="button"
              class="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary-orange-500 hover:bg-primary-orange-100/40 focus-visible:outline-2 focus-visible:outline-offset-2"
              @click.stop="run(toast)"
            >
              {{ toast.actionLabel ?? messages.open }}
            </button>
          </div>
        </div>
        <button
          type="button"
          :aria-label="messages.dismiss"
          class="grid size-8 shrink-0 place-items-center self-start rounded-lg text-base-neutral-400 hover:bg-base-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-orange-500 dark:hover:bg-base-neutral-700"
          @click.stop="dismissToast(toast.id)"
        >
          <AppIcon name="CloseCircle" :size="18" />
        </button>
      </div>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { copyToClipboard } from '../utils/helpers'
import AppIcon from './AppIcon.vue'
import { dismissToast, feedbackState, type ToastKind } from './feedback'
import type { IconName } from './icon-names'
import { useVueKit } from './plugin'

const { messages } = useVueKit()
const toasts = computed(() => feedbackState.toasts)
const copiedId = ref<string>()

type ShownToast = (typeof feedbackState.toasts)[number]

const kinds: Record<ToastKind, { icon: IconName; tile: string }> = {
  success: { icon: 'TickCircle', tile: 'bg-app-success' },
  error: { icon: 'CloseCircle', tile: 'bg-app-error' },
  info: { icon: 'InfoCircle', tile: 'bg-app-info' },
  warning: { icon: 'Danger', tile: 'bg-app-warning' },
}

const run = async (toast: ShownToast) => {
  await toast.action?.()
  dismissToast(toast.id)
}

const copy = async (toast: ShownToast) => {
  await copyToClipboard(
    typeof toast.message === 'string' ? toast.message : toast.message.join('\n'),
  )
  copiedId.value = toast.id
  setTimeout(() => (copiedId.value = undefined), 2000)
}
</script>
