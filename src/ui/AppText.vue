<template>
  <component :is="tag" v-bind="restAttrs" :class="mergedClass">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { useMergedClass } from './merge-class'
import {
  textColorClasses,
  textSizeClasses,
  textWeightClasses,
  type TextColor,
  type TextSize,
  type TextWeight,
} from './styles'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'label'
    size?: TextSize
    weight?: TextWeight
    color?: TextColor
  }>(),
  { tag: 'div', size: '16', weight: 'normal', color: 'black' },
)

const { mergedClass, restAttrs } = useMergedClass(
  () =>
    `font-poppins ${textSizeClasses[props.size]} ${textWeightClasses[props.weight]} ${textColorClasses[props.color]}`,
)
</script>
