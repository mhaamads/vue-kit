<template>
  <dialog
    ref="dialog"
    v-bind="dialogProps"
    :aria-labelledby="titleId"
    :aria-describedby="messageId"
    class="m-auto w-full max-w-100 rounded-2xl bg-white p-4 text-center backdrop:bg-black/40 dark:bg-base-neutral-800"
  >
    <template v-if="request">
      <div
        v-if="request.type"
        class="relative mx-auto mb-5 grid aspect-square h-24 w-max place-content-center"
      >
        <div class="absolute inset-0 blur-lg" :class="look.glow" />
        <AppIcon :name="look.icon" type="bold" :size="60" class="relative" :class="look.fill" />
      </div>
      <AppText :id="titleId" tag="h2" size="20" weight="medium" class="mb-1">
        {{ request.title ?? messages.confirmTitle }}
      </AppText>
      <AppText :id="messageId" tag="p" size="18" color="neutral-600">{{ request.message }}</AppText>

      <div v-if="request.confirmText" class="mt-6 text-start">
        <label
          :for="inputId"
          class="mb-3 block text-xs text-base-neutral-600 dark:text-base-neutral-100"
        >
          {{ messages.typeToConfirm(request.confirmText) }}
        </label>
        <input
          :id="inputId"
          v-model="typed"
          autocomplete="off"
          :placeholder="request.confirmText"
          class="h-10 w-full rounded-xl border border-neutral-input bg-surface-100 px-3 text-sm outline-none focus:border-primary-red-700"
        />
      </div>

      <div
        class="flex items-center justify-center gap-3"
        :class="request.confirmText ? 'mt-6' : 'mt-8'"
      >
        <AppButton
          size="40"
          class="w-full"
          :variant="request.cancelVariant ?? 'outline'"
          :text="request.cancelLabel ?? messages.cancel"
          @click="answerConfirm(false)"
        />
        <AppButton
          size="40"
          class="w-full"
          :variant="request.confirmVariant ?? 'primary'"
          :text="request.confirmLabel ?? messages.confirm"
          :disabled="!!request.confirmText && typed !== request.confirmText"
          @click="answerConfirm(true)"
        />
      </div>
    </template>
  </dialog>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import AppButton from './AppButton.vue'
import AppIcon from './AppIcon.vue'
import AppText from './AppText.vue'
import { answerConfirm, feedbackState, type ToastKind } from './feedback'
import type { IconName } from './icon-names'
import { useModalDialog } from './overlay'
import { useVueKit } from './plugin'

const { messages } = useVueKit()
const request = computed(() => feedbackState.confirm)

// Open while a request is pending; Escape answers "no". The backdrop doesn't close it (portal).
// The first control gets focus: Cancel, or the confirmation input when one is required.
const open = computed({
  get: () => !!request.value,
  set: (value) => value || answerConfirm(false),
})
const { dialog, dialogProps } = useModalDialog(open, {
  closeOnEscape: () => true,
  closeOnBackdrop: () => false,
})
const typed = ref('')
const titleId = useId()
const messageId = useId()
const inputId = useId()

const looks: Record<ToastKind, { icon: IconName; glow: string; fill: string }> = {
  warning: { icon: 'Danger', glow: 'bg-app-yellow-50', fill: '**:fill-app-warning' },
  error: { icon: 'Danger', glow: 'bg-app-red-50', fill: '**:fill-app-error' },
  info: { icon: 'InfoCircle', glow: 'bg-app-blue-50', fill: '**:fill-app-info' },
  success: { icon: 'TickCircle', glow: 'bg-app-green-50', fill: '**:fill-app-success' },
}
const look = computed(() => looks[request.value?.type ?? 'warning'])

watch(request, () => (typed.value = ''))
</script>
