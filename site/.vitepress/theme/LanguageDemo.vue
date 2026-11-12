<template>
  <div class="vp-raw demo" :dir="kit.dir.value">
    <div class="mb-4 flex gap-2" dir="ltr">
      <AppButton
        :variant="kit.locale.value === 'en' ? 'primary' : 'secondary'"
        @click="kit.setLocale('en')"
      >
        English
      </AppButton>
      <AppButton
        :variant="kit.locale.value === 'ckb' ? 'primary' : 'secondary'"
        @click="kit.setLocale('ckb')"
      >
        کوردی
      </AppButton>
    </div>
    <div class="max-w-md text-vk-fg"><slot /></div>
  </div>
</template>

<script setup lang="ts">
// A language example with its own kit (provideVueKit), so switching only changes this box,
// not the rest of the docs.
import { AppButton, createVueKit, provideVueKit } from '../../../src/ui'
import { ckb } from '../../skin/ckb'
import { ui } from '../../skin/ui'

const kit = createVueKit({ ui, locales: { ckb }, syncDocument: false })
provideVueKit(kit)
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
