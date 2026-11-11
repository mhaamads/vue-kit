<template>
  <VsxIcon :icon-name="name" :size="size" :color="color" :type="type" aria-hidden="true" />
</template>

<script setup lang="ts">
import { VsxIcon } from 'vue-iconsax'
import type { IconName } from './icon-names'
import type { IconType } from './styles'

// Decorative by default: put the accessible name on the button or link around it.
// `color` defaults to currentColor (portal used #000) so icons follow the text colour in dark mode;
// the `icon-*` utilities from theme.css still override the stroke.
const {
  name,
  size = 20,
  color = 'currentColor',
  type = 'linear',
} = defineProps<{
  name: IconName
  size?: number | string
  color?: string
  type?: IconType
}>()
</script>
