<script setup lang="ts">
// The 5.4 s intro (site/loading, rendered to public/intro.mp4), on every page load.
// The Skip button turns it off for this browser: the head script
// in config.ts then adds `vk-intro-off` before the first paint. Never shown with reduced motion.
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { withBase } from 'vitepress'

const shown = ref(true)
const leaving = ref(false)
const video = useTemplateRef<HTMLVideoElement>('video')
let fallback: ReturnType<typeof setTimeout> | undefined

const close = () => {
  if (leaving.value) return
  leaving.value = true
  setTimeout(() => (shown.value = false), 300)
}
const skip = () => {
  try {
    localStorage.setItem('vk-intro-skipped', '1')
  } catch {
    // storage blocked (private mode): it just shows again next time
  }
  close()
}

onMounted(() => {
  const off = document.documentElement.classList.contains('vk-intro-off')
  if (off || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = false
    return
  }
  video.value?.play().catch(close) // autoplay blocked (e.g. battery saver): skip the intro
  fallback = setTimeout(close, 7000) // never stuck on a stalled video
})
onBeforeUnmount(() => {
  clearTimeout(fallback)
})
</script>

<template>
  <div v-if="shown" class="vk-intro" :class="{ leaving }">
    <video
      ref="video"
      :src="withBase('/intro.mp4')"
      muted
      playsinline
      preload="auto"
      aria-hidden="true"
      @ended="close"
    />
    <button type="button" class="vk-intro-skip" @click="skip">Skip</button>
  </div>
</template>
