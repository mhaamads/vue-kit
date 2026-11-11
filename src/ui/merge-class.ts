import { computed, normalizeClass, useAttrs } from 'vue'
import { twMerge } from 'tailwind-merge'

/**
 * For components with `inheritAttrs: false`: the default classes merged with the caller's
 * `class` (caller wins on conflicts, e.g. `h-12` over `h-10`), plus the remaining attrs.
 */
export const useMergedClass = (base: () => string) => {
  const attrs = useAttrs()
  return {
    mergedClass: computed(() => twMerge(base(), normalizeClass(attrs.class))),
    restAttrs: computed(() =>
      Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class')),
    ),
  }
}
