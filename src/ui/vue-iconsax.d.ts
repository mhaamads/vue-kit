// vue-iconsax 2.x ships no types; this covers the one component the kit uses.
declare module 'vue-iconsax' {
  import type { DefineComponent } from 'vue'

  export const VsxIcon: DefineComponent<{
    iconName: string
    size?: number | string
    color?: string
    type?: string
  }>
}
