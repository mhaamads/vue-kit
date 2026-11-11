// Native modal <dialog> behind AppDialog and AppDrawer: the browser provides the focus trap,
// Escape (`cancel` event) and top-layer stacking, so no teleport or z-index is needed.
import {
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue'

type OverlayContext = { titleId: string; hasTitle: Ref<boolean>; close: () => void }
const overlayKey: InjectionKey<OverlayContext> = Symbol('vue-kit-overlay')

const FOCUSABLE =
  '[autofocus], button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const useModalDialog = (
  open: Ref<boolean>,
  options: { closeOnEscape: () => boolean; closeOnBackdrop: () => boolean },
) => {
  const dialog = ref<HTMLDialogElement>()
  const hasTitle = ref(false)
  const titleId = useId()
  let returnFocus: HTMLElement | null = null

  const close = () => (open.value = false)

  watch(
    open,
    async (isOpen) => {
      await nextTick()
      const el = dialog.value
      if (!el) return
      if (isOpen && !el.open) {
        returnFocus = document.activeElement as HTMLElement | null
        el.showModal()
        // Browsers focus the first control themselves; do it explicitly so every engine agrees.
        if (!el.contains(document.activeElement)) {
          ;(el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus()
        }
      } else if (!isOpen && el.open) {
        el.close()
        // Only after close(): while the modal is open, everything outside it is inert.
        returnFocus?.focus?.()
        returnFocus = null
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (dialog.value?.open) dialog.value.close()
  })

  provide(overlayKey, { titleId, hasTitle, close })

  return {
    dialog,
    dialogProps: {
      onCancel: (event: Event) => {
        event.preventDefault()
        if (options.closeOnEscape()) close()
      },
      // A click whose target is the <dialog> itself landed on the backdrop area, not the content.
      onClick: (event: MouseEvent) => {
        if (event.target === dialog.value && options.closeOnBackdrop()) close()
      },
      // Closed by the browser (e.g. a <form method="dialog">): keep v-model in sync.
      onClose: () => {
        if (open.value) close()
      },
    },
    labelledBy: () => (hasTitle.value ? titleId : undefined),
  }
}

/** For AppOverlayHeading: the surrounding dialog's title id and close function, if any. */
export const useOverlayContext = () => inject(overlayKey, undefined)
