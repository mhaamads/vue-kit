// A consumer app: everything here must type-check and bundle against the installed tarball.
import { createApp, h } from 'vue'
import { formatDate } from '@mhaamads/vue-kit/utils'
import { AppButton, AppInput, AppToasts, createVueKit } from '@mhaamads/vue-kit/ui'
import './style.css'

const today: string | undefined = formatDate(new Date())

createApp({
  render: () => [
    h('p', { class: 'text-sm' }, today),
    h(AppInput, { label: 'Email', ui: { input: 'rounded-xl border px-3' } }),
    h(AppButton, { class: 'rounded-xl bg-black px-4 text-white' }, () => 'Save'),
    h(AppToasts),
  ],
})
  .use(
    createVueKit({
      ui: { input: { label: 'text-sm font-medium' } },
      locales: { en: { messages: { loading: 'Loading…' } } },
    }),
  )
  .mount('#app')
