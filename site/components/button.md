# Button

`AppButton`: a button that can show loading, be disabled, or be a link.

<Demo>
  <div class="flex flex-wrap gap-3">
    <AppButton variant="primary">Save</AppButton>
    <AppButton variant="secondary">Cancel</AppButton>
    <AppButton variant="danger">Delete</AppButton>
    <AppButton variant="ghost">More</AppButton>
    <AppButton variant="primary" loading>Saving</AppButton>
  </div>
</Demo>

```vue
<AppButton variant="primary">Save</AppButton>
<AppButton variant="primary" loading>Saving</AppButton>
<AppButton to="/tasks">Go to tasks</AppButton> <!-- a link -->
```

## Give buttons your look, once

```ts
createVueKit({
  ui: {
    button: {
      default: 'h-10 rounded-lg border px-4',
      primary: 'h-10 rounded-lg bg-blue-600 px-4 text-white',
      secondary: 'h-10 rounded-lg border px-4',
      danger: 'h-10 rounded-lg bg-red-600 px-4 text-white',
      ghost: 'rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100',
    },
  },
})
```

**The kit uses these too.** Every button it draws is an `AppButton`, so it matches your app:

| Button                                                         | Variant                          |
| -------------------------------------------------------------- | -------------------------------- |
| Confirm dialog: Confirm / Cancel                               | `primary` (`danger` for errors) / `secondary` |
| Time picker: OK                                                | `primary`                        |
| Show password, Copy, Clear, dialog Close, toast buttons, chip × | `ghost`                         |

You can add your own variant names (`variant="link"`) too. A `class` on one button adds to its
variant.

## Props

| Prop       | What                                                 |
| ---------- | ---------------------------------------------------- |
| `variant`  | Which look from `ui.button` (default: `default`)     |
| `loading`  | Disabled and marked busy (`data-loading`)            |
| `disabled` | Disabled (`data-disabled`)                           |
| `to`       | Makes it a link (uses `RouterLink` when you have vue-router) |
| `as`       | Another element or component, e.g. `label` or `NuxtLink` |

It's `type="button"` unless you set `type="submit"`.
