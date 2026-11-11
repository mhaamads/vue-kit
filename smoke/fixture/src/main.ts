// A consumer app: everything here must type-check and bundle against the installed tarball.
import { createApp, h } from 'vue'
import { formatDate } from '@moonlinetravel/vue-kit/utils'
import './style.css'

const today: string | undefined = formatDate(new Date())
createApp({ render: () => h('p', { class: 'text-sm' }, today) }).mount('#app')
