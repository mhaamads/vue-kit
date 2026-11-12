<template>
  <p
    v-if="part !== 'errors' && field.hint"
    v-bind="field.hintProps"
    class="mt-1.5 text-xs text-body-muted"
  >
    {{ field.hint }}
  </p>
  <ul
    v-if="part !== 'hint' && field.invalid"
    v-bind="field.errorProps"
    class="mt-2 grid list-inside list-disc gap-0.5 text-xs text-app-error"
  >
    <li v-for="(message, i) in field.errors" :key="i">{{ message }}</li>
  </ul>
</template>

<script setup lang="ts">
// Hint and error list shared by every input skin (ids come from useField).
defineProps<{
  /** Render only the hint or only the errors; both by default. */
  part?: 'hint' | 'errors'
  field: {
    hint?: string
    hintProps: { id: string }
    invalid: boolean
    errors: string[]
    errorProps: { id: string; role: 'alert' }
  }
}>()
</script>
