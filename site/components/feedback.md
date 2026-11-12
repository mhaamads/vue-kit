# Toasts and confirm

Put these two **once** in `App.vue`. Then call them from anywhere: components, stores, plain files.

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <AppToasts />
  <AppConfirmDialog />
</template>
```

<script setup>
import { ref } from 'vue'
import { useConfirm, useToast } from '../../src/ui'

const answer = ref('')
const toast = (type) =>
  useToast({
    type,
    message: type === 'error' ? ['Name is required.', 'Email is not valid.'] : `This is a ${type} message.`,
  })
const ask = async () => (answer.value = String(await useConfirm('Archive this task?')))
const askTyped = async () =>
  (answer.value = String(
    await useConfirm({ type: 'error', title: 'Delete project', message: 'This removes all tasks.', confirmText: 'delete' }),
  ))
</script>

## Toast

<Demo>
  <div class="flex flex-wrap gap-3">
    <AppButton variant="primary" @click="toast('success')">Success</AppButton>
    <AppButton variant="danger" @click="toast('error')">Error</AppButton>
    <AppButton variant="secondary" @click="toast('info')">Info</AppButton>
  </div>
</Demo>

```ts
import { useToast } from '@mhaamads/vue-kit/ui'

useToast({ type: 'success', message: 'Saved.' })
useToast({ type: 'error', message: ['Name is required.', 'Email is not valid.'] })
useToast({ type: 'info', message: 'Task updated', action: openTask, actionLabel: 'Open' })
```

Toasts close by themselves (errors stay longer). Only the newest two are shown. While a dialog is
open, toasts show on top of it, so "Save failed" from inside an edit dialog is always visible and
clickable.

## Confirm

<Demo>
  <div class="flex flex-wrap items-center gap-3">
    <AppButton variant="primary" @click="ask">Ask</AppButton>
    <AppButton variant="danger" @click="askTyped">Ask, type to confirm</AppButton>
    <span class="text-sm">Answer: <code>{{ answer || '—' }}</code></span>
  </div>
</Demo>

```ts
import { useConfirm } from '@mhaamads/vue-kit/ui'

if (await useConfirm('Archive this task?')) archive()

// The user must type "delete" first:
await useConfirm({ title: 'Delete project', message: 'This removes all tasks.', confirmText: 'delete' })
```

## Make them look like your app

They are built from the kit's own parts, so your app-wide classes already style them:

| Part                                   | Styled by                                       |
| -------------------------------------- | ----------------------------------------------- |
| Confirm button / Cancel button         | `ui.button.primary` (`danger` for errors) / `ui.button.secondary` |
| The "type to confirm" field            | `ui.input`, like every `AppInput`               |
| Toast Copy / action / dismiss buttons  | `ui.button.ghost`                               |

To change only these, use their own keys. They're added on top of the button look:

```ts
createVueKit({
  ui: {
    confirm: { root: 'rounded-2xl p-6', actions: 'flex justify-end gap-2', confirm: 'min-w-24' },
    toasts: { toast: 'rounded-xl border p-4 data-[type=error]:border-red-600' },
  },
})
```

Toast slots: `message` (gets `toast`) and `close` (gets `toast`, `dismiss`), e.g.
`<AppToasts><template #close="{ dismiss }">…</template></AppToasts>`.

**Style keys (toasts):** `root` `toast` `message` `actions` `copy` `action` `close`

**Style keys (confirm):** `root` `title` `message` `actions` `cancel` `confirm`
