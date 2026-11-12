<template>
  <p v-if="field.hint || $slots.hint" v-bind="field.hintProps" data-hint :class="ui.hint">
    <slot name="hint" :hint="field.hint">{{ field.hint }}</slot>
  </p>
  <div v-if="field.invalid" v-bind="field.errorProps" data-errors :class="ui.errors">
    <slot name="errors" :errors="field.errors" :error="field.errors[0]">
      <p v-for="(message, i) in field.errors" :key="i">{{ message }}</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
// Hint and errors shared by every input (ids come from useField). The input forwards its own
// `hint` / `errors` slots here.
defineProps<{
  field: {
    hint?: string
    hintProps: { id: string }
    invalid: boolean
    errors: string[]
    errorProps: { id: string; role: 'alert' }
  }
  ui: { hint?: string; errors?: string }
}>()
</script>
