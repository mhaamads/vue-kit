// Docs theme: VitePress's default theme plus the kit, styled by the example skin (site/skin).
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import * as Kit from '../../../src/ui'
import { ui } from '../../skin/ui'
import Demo from './Demo.vue'
import LanguageDemo from './LanguageDemo.vue'
import IntroScreen from './IntroScreen.vue'
import './style.css'

// The docs stay in English; the language example has its own kit (LanguageDemo.vue).
const kit = Kit.createVueKit({ ui, syncDocument: false })

export default {
  extends: DefaultTheme,
  // Toasts and the confirm dialog, mounted once like an app does (inside vp-raw, so the docs'
  // own button and heading resets don't override the skin).
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'layout-top': () => h(IntroScreen),
      'layout-bottom': () =>
        h('div', { class: 'vp-raw' }, [h(Kit.AppToasts), h(Kit.AppConfirmDialog)]),
    }),
  enhanceApp({ app }) {
    app.use(kit)
    app.component('Demo', Demo)
    app.component('LanguageDemo', LanguageDemo)
    // Every App* component is usable in the pages without imports.
    for (const [name, value] of Object.entries(Kit)) {
      if (name.startsWith('App')) app.component(name, value as never)
    }
  },
} satisfies Theme
