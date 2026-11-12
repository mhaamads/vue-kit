// Positions a dropdown under its anchor with floating-ui: fixed (no teleport, so it works inside a
// modal <dialog>), flips up when there's no room below. Shared by AppSelect and the country picker.
import type { Ref } from 'vue'
import { autoUpdate, flip, offset, size, useFloating } from '@floating-ui/vue'

export const useDropdown = (
  anchor: Readonly<Ref<HTMLElement | null>>,
  dropdown: Readonly<Ref<HTMLElement | null>>,
  /** `match`: as wide as the anchor. `min`: at least as wide, and at least `minWidth` px. */
  width: { match: true } | { match: false; minWidth: number } = { match: true },
) =>
  useFloating(anchor, dropdown, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(5),
      flip({ padding: 8 }),
      size({
        apply: ({ rects, elements }) => {
          const w = `${rects.reference.width}px`
          Object.assign(
            elements.floating.style,
            width.match ? { width: w } : { minWidth: `max(${w}, ${width.minWidth}px)` },
          )
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  })
