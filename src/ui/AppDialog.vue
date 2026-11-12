<template>
  <dialog
    ref="dialog"
    v-bind="dialogProps"
    :aria-labelledby="title || $slots.title ? titleId : undefined"
    data-dialog
    :data-position="position"
    :class="ui.root"
  >
    <div v-if="open" :class="ui.panel">
      <header v-if="title || $slots.title || closeable" :class="ui.header">
        <h2 v-if="title || $slots.title" :id="titleId" :class="ui.title">
          <slot name="title" :title="title">{{ title }}</slot>
        </h2>
        <slot v-if="closeable" name="close" :close="close">
          <AppButton variant="ghost" data-dialog-close :class="ui.close" @click="close">
            {{ messages.close }}
          </AppButton>
        </slot>
      </header>
      <div :class="ui.body"><slot :close="close" /></div>
      <footer v-if="$slots.footer" :class="ui.footer">
        <slot name="footer" :close="close" />
      </footer>
    </div>
  </dialog>
</template>

<script setup lang="ts">
// Modal on the native <dialog>: focus trap, Escape and stacking come from the browser; focus
// returns to the opener. `position` only sets data-position, so one component covers centred
// dialogs and start / end drawers. A click on the <dialog> itself counts as a backdrop click:
// make `ui.root` a full-screen transparent box and put the look on `ui.panel`.
// Slots: default and `footer` (get `close`), `title`, and `close` to replace the close button.
import { useId } from 'vue'
import AppButton from './AppButton.vue'
import { useModalDialog } from './overlay'
import { useVueKit } from './plugin'
import { useUi, type DialogUi } from './ui'

const props = withDefaults(
  defineProps<{
    title?: string
    /** Show the close button in the header. */
    closeable?: boolean
    /** `center` dialog, or a drawer from the `start` / `end` edge (data-position for your CSS). */
    position?: 'center' | 'start' | 'end'
    closeOnEscape?: boolean
    closeOnBackdrop?: boolean
    /** Classes per piece; wins over `createVueKit({ ui: { dialog } })`. */
    ui?: DialogUi
  }>(),
  { closeable: true, position: 'center', closeOnEscape: true, closeOnBackdrop: true },
)
const open = defineModel<boolean>({ default: false })

const { messages } = useVueKit()
const ui = useUi('dialog', () => props.ui)
const titleId = useId()
const close = () => (open.value = false)
const { dialog, dialogProps } = useModalDialog(open, {
  closeOnEscape: () => props.closeOnEscape,
  closeOnBackdrop: () => props.closeOnBackdrop,
})
</script>
