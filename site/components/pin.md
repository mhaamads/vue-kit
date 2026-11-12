# Code / PIN

`AppPinInput`: boxes for a one-time code or a PIN.

<script setup>
import { ref } from 'vue'
const code = ref('')
const done = ref('')
const pin = ref('')
</script>

<Demo>
  <AppPinInput v-model="code" label="Verification code" @complete="(c) => (done = c)" />
  <p class="mt-3 text-xs text-vk-muted">v-model: <code>{{ JSON.stringify(code) }}</code> · complete: <code>{{ done || '—' }}</code></p>
</Demo>

```vue
<AppPinInput v-model="code" label="Verification code" @complete="verify" />
```

## Any length

<Demo>
  <AppPinInput v-model="pin" label="PIN" :length="4" />
</Demo>

```vue
<AppPinInput v-model="pin" label="PIN" :length="4" />
```

## Made to be reliable

- **Paste works:** paste the whole code into any box. Spaces, dashes and text around it
  (`Your code: 123-456`) are removed.
- **Phone auto-fill works:** codes from an SMS are offered above the keyboard on iOS and Android.
- **Number keyboard on phones.**
- **Arabic and Persian digits** (`١٢٣٤`, `۱۲۳۴`) become `1234`.
- **Backspace, select all, and screen readers** work like a normal field, because it is one real
  field under the boxes.
- **Stays left-to-right** on right-to-left pages, so codes read in order.
- **`@complete`** fires once all boxes are filled, so you can verify without a button.

After a wrong code, clear it and focus again:

```vue
<AppPinInput ref="pinRef" v-model="code" :errors="wrong ? ['Wrong code.'] : []" @complete="verify" />

<script setup lang="ts">
const verify = async (value: string) => {
  if (!(await api.verify(value))) {
    code.value = ''
    pinRef.value.focus()
  }
}
</script>
```

## Props

| Prop                      | What                                     |
| ------------------------- | ---------------------------------------- |
| `v-model`                 | The code, a string of digits             |
| `length`                  | How many boxes (default 6)               |
| `label`, `hint`, `errors` | As in every input                        |
| `disabled`, `readonly`    | As usual                                 |

**Events:** `complete` (the full code). **From code:** `focus()`.

**Slots:** `label`, `hint`, `errors`.

**Style keys:** `root` `label` `control` `input` `cell` `hint` `errors`. Each box is a `cell`;
style the next box to fill with `data-active`, filled ones with `data-filled`.
