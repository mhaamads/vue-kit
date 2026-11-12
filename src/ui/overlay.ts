// Native modal <dialog> behind AppDialog and AppConfirmDialog: the browser provides the focus
// trap, Escape (`cancel` event) and top-layer stacking, so no teleport or z-index is needed.
import { nextTick, onBeforeUnmount, ref, shallowReactive, watch, type Ref } from 'vue'

// The kit's open modal dialogs, oldest first. Everything outside the top one is inert, so
// AppToasts moves into it (see AppToasts.vue), and the page behind must not scroll.
const openDialogs = shallowReactive<HTMLDialogElement[]>([])
/** The topmost open kit dialog still on the page, if any (a removed one doesn't count). */
export const getTopDialog = () => openDialogs.filter((el) => el.isConnected && el.open).at(-1)

let unlockScroll: (() => void) | undefined
const lockScroll = () => {
  const html = document.documentElement
  const before = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter }
  // Keep the scrollbar's space, so the page doesn't jump sideways (works in RTL too).
  if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = 'stable'
  html.style.overflow = 'hidden'
  unlockScroll = () => {
    html.style.overflow = before.overflow
    html.style.scrollbarGutter = before.gutter
  }
}

const opened = (el: HTMLDialogElement) => {
  if (!openDialogs.length) lockScroll()
  openDialogs.push(el)
}
const released = (el: HTMLDialogElement | undefined) => {
  const index = el ? openDialogs.indexOf(el) : -1
  if (index === -1) return
  openDialogs.splice(index, 1)
  if (!openDialogs.length) {
    unlockScroll?.()
    unlockScroll = undefined
  }
}

const FOCUSABLE =
  '[autofocus], button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const useModalDialog = (
  open: Ref<boolean>,
  options: { closeOnEscape: () => boolean; closeOnBackdrop: () => boolean },
) => {
  const dialog = ref<HTMLDialogElement>()
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
        opened(el)
        // Browsers focus the first control themselves; do it explicitly so every engine agrees.
        if (!el.contains(document.activeElement)) {
          ;(el.querySelector<HTMLElement>(FOCUSABLE) ?? el).focus()
        }
      } else if (!isOpen && el.open) {
        el.close()
        released(el)
        // Only after close(): while the modal is open, everything outside it is inert.
        returnFocus?.focus?.()
        returnFocus = null
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (dialog.value?.open) dialog.value.close()
    released(dialog.value)
  })

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
        released(dialog.value)
        if (open.value) close()
      },
    },
  }
}
