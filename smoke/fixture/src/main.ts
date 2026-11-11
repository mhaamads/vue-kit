// A consumer app: everything here must type-check and bundle against the installed tarball.
import { createApp, h } from 'vue'
import { formatDate } from '@moonlinetravel/vue-kit/utils'
import { AppButton, AppText, createVueKit } from '@moonlinetravel/vue-kit/ui'
import './style.css'

const today: string | undefined = formatDate(new Date())

createApp({
  render: () => [h(AppText, { tag: 'p', size: '14' }, () => today), h(AppButton, { text: 'Save', icon: 'Add' })],
})
  .use(createVueKit({ messages: { loading: 'Loading…' } }))
  .mount('#app')
