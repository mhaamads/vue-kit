<template>
  <div class="vp-raw demo" :dir="dir">
    <div class="max-w-md text-vk-fg"><slot /></div>
  </div>
</template>

<script setup lang="ts">
// A live example box. The kit's direction follows the docs' language example.
import { useVueKit } from '../../../src/ui'

const { dir } = useVueKit()
</script>

<style scoped>
.demo {
  margin: 16px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vk-bg);
  font-family: var(--vk-font);
}
</style>
