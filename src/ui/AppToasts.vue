<template>
  <!-- While a kit dialog is open, everything outside it is inert and under its backdrop, so the
       toasts move into the top dialog (they stay position: fixed, so they look the same). -->
  <Teleport :to="getTopDialog() ?? 'body'" :disabled="!getTopDialog()">
    <section :aria-label="messages.notifications" aria-live="polite" data-toasts :class="ui.root">
      <!-- Transition classes: .vk-toast-enter-from, .vk-toast-leave-to, ... (define them in your CSS). -->
      <TransitionGroup name="vk-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          data-toast
          :data-type="toast.type"
          :role="toast.type === 'error' ? 'alert' : undefined"
          :class="ui.toast"
        >
          <slot name="message" :toast="toast">
            <ul v-if="typeof toast.message !== 'string'" :class="ui.message">
              <li v-for="(line, i) in toast.message" :key="i">{{ line }}</li>
            </ul>
            <p v-else :class="ui.message">{{ toast.message }}</p>
          </slot>
          <div v-if="toast.type === 'error' || toast.action" :class="ui.actions">
            <AppButton
              v-if="toast.type === 'error'"
              variant="ghost"
              :class="ui.copy"
              @click="copy(toast)"
            >
              {{ copiedId === toast.id ? messages.copied : messages.copy }}
            </AppButton>
            <AppButton v-if="toast.action" variant="ghost" :class="ui.action" @click="run(toast)">
              {{ toast.actionLabel ?? messages.open }}
            </AppButton>
          </div>
          <slot name="close" :toast="toast" :dismiss="() => dismissToast(toast.id)">
            <AppButton
              variant="ghost"
              data-toast-close
              :class="ui.close"
              @click="dismissToast(toast.id)"
            >
              {{ messages.dismiss }}
            </AppButton>
          </slot>
        </div>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<script setup lang="ts">
// Toast stack: mount once at the app root, then call useToast() from anywhere. Style each type
// from data-type, e.g. `data-[type=error]:border-red-600` in `ui.toast`. Buttons are AppButtons
// (`ghost` variant). Slots: `message` (gets `toast`) and `close` (gets `toast`, `dismiss`).
import { computed, ref } from 'vue'
import AppButton from './AppButton.vue'
import { copyToClipboard } from '../utils/helpers'
import { dismissToast, feedbackState } from './feedback'
import { useVueKit } from './plugin'
import { getTopDialog } from './overlay'
import { useUi, type ToastsUi } from './ui'

const props = defineProps<{
  /** Classes per piece; wins over `createVueKit({ ui: { toasts } })`. */
  ui?: ToastsUi
}>()

const { messages } = useVueKit()
const ui = useUi('toasts', () => props.ui)
const toasts = computed(() => feedbackState.toasts)
const copiedId = ref<string>()

type ShownToast = (typeof feedbackState.toasts)[number]

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
