<template>
  <dialog
    ref="dialog"
    v-bind="dialogProps"
    :aria-labelledby="titleId"
    :aria-describedby="messageId"
    data-confirm
    :data-type="request?.type"
    :class="ui.root"
  >
    <template v-if="request">
      <h2 :id="titleId" :class="ui.title">{{ request.title ?? messages.confirmTitle }}</h2>
      <p :id="messageId" :class="ui.message">{{ request.message }}</p>
      <AppInput
        v-if="request.confirmText"
        v-model="typed"
        :label="messages.typeToConfirm(request.confirmText)"
        :placeholder="request.confirmText"
        autocomplete="off"
      />
      <div :class="ui.actions">
        <AppButton
          variant="secondary"
          data-confirm-cancel
          :class="ui.cancel"
          @click="answerConfirm(false)"
        >
          {{ request.cancelLabel ?? messages.cancel }}
        </AppButton>
        <AppButton
          :variant="request.type === 'error' ? 'danger' : 'primary'"
          data-confirm-action
          :disabled="!canConfirm"
          :class="ui.confirm"
          @click="answerConfirm(true)"
        >
          {{ request.confirmLabel ?? messages.confirm }}
        </AppButton>
      </div>
    </template>
  </dialog>
</template>

<script setup lang="ts">
// Confirm dialog: mount once at the app root, then `await useConfirm(...)` from anywhere. Escape
// answers no; the backdrop doesn't close it. The first control gets focus. Built from AppButton
// (`secondary` / `primary`, or `danger` for error requests) and AppInput, so it matches your app.
import { computed, ref, useId, watch } from 'vue'
import AppButton from './AppButton.vue'
import AppInput from './inputs/AppInput.vue'
import { answerConfirm, feedbackState } from './feedback'
import { useModalDialog } from './overlay'
import { useVueKit } from './plugin'
import { useUi, type ConfirmUi } from './ui'

const props = defineProps<{
  /** Classes per piece; wins over `createVueKit({ ui: { confirm } })`. */
  ui?: ConfirmUi
}>()

const { messages } = useVueKit()
const ui = useUi('confirm', () => props.ui)
const request = computed(() => feedbackState.confirm)

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
watch(request, () => (typed.value = ''))

const canConfirm = computed(
  () => !request.value?.confirmText || typed.value === request.value.confirmText,
)
</script>
