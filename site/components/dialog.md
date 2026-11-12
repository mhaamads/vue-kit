# Dialog and drawer

`AppDialog`: a popup window. Escape or clicking outside closes it, and focus goes back to the button.
While it's open, the page behind it doesn't scroll.

<script setup>
import { ref } from 'vue'
const open = ref(false)
const drawer = ref(false)
</script>

<Demo>
  <div class="flex gap-3">
    <AppButton variant="primary" @click="open = true">Open dialog</AppButton>
    <AppButton variant="secondary" @click="drawer = true">Open drawer</AppButton>
  </div>
  <AppDialog v-model="open" title="Edit task">
    <AppInput label="Title" model-value="Prepare visa documents" />
    <template #footer="{ close }">
      <AppButton variant="secondary" @click="close">Cancel</AppButton>
      <AppButton variant="primary" @click="close">Save</AppButton>
    </template>
  </AppDialog>
  <AppDialog v-model="drawer" title="Filters" position="end">
    <p>A drawer is the same dialog with <code>position="end"</code>.</p>
  </AppDialog>
</Demo>

```vue
<AppButton @click="open = true">Open dialog</AppButton>

<AppDialog v-model="open" title="Edit task">
  <AppInput label="Title" />
  <template #footer="{ close }">
    <AppButton @click="close">Save</AppButton>
  </template>
</AppDialog>

<AppDialog v-model="drawer" title="Filters" position="end">…</AppDialog>
```

## Props

| Prop                                  | What                                       |
| ------------------------------------- | ------------------------------------------ |
| `v-model`                             | Open or closed                             |
| `title`                               | Heading                                    |
| `position`                            | `center` (default), `start` or `end` (drawer) |
| `closeable`                           | Show the close button (default on)         |
| `close-on-escape`, `close-on-backdrop` | Turn those off (default on)               |

**Slots:** default (the content) and `footer` (both get `close`), `title`, `close` (your own close
button, gets `close`). The built-in close button is an `AppButton` with the `ghost` look.

**Style keys:** `root` `panel` `header` `title` `close` `body` `footer`
