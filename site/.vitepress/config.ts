import { defineConfig, postcssIsolateStyles } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

// The docs site. Not part of the package (`files` ships dist/ only). `npm run docs`

// GitHub Pages serves it under the repo name (/vue-kit/); the deploy workflow sets DOCS_BASE.
const base = (process.env as Record<string, string | undefined>).DOCS_BASE || '/'

export default defineConfig({
  base,
  title: 'vue-kit',
  description: 'Unstyled Vue 3 inputs, dialogs and toasts for Vue 3',
  cleanUrls: true,
  // Dark by default; the toggle still switches to light.
  appearance: 'dark',
  // The intro video's source project, not a docs page.
  srcExclude: ['loading/**'],
  head: [
    // head entries don't get the base added, so it's added here.
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    // The intro stays off for anyone who skipped it (theme/IntroScreen.vue).
    [
      'script',
      {},
      "try { if (localStorage.getItem('vk-intro-skipped')) document.documentElement.classList.add('vk-intro-off') } catch {}",
    ],
  ],
  vite: {
    // Tailwind's plugin is typed for Vite 7; VitePress 1 runs Vite 5, which it also supports.
    plugins: [tailwindcss() as never],
    // Keeps the docs' own text styles out of live examples (everything inside .vp-raw).
    css: {
      postcss: { plugins: [postcssIsolateStyles({ includeFiles: [/vp-doc\.css/, /base\.css/] })] },
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    search: { provider: 'local' },
    outline: { level: [2, 2], label: 'On this page' },
    sidebar: [
      {
        text: 'Start here',
        items: [
          { text: 'Getting started', link: '/' },
          { text: 'Customize', link: '/styling' },
          { text: 'Languages', link: '/languages' },
          { text: 'Nuxt', link: '/nuxt' },
          { text: 'HTTP client', link: '/http' },
          { text: 'AI coding skill', link: '/skill' },
        ],
      },
      {
        text: 'Inputs',
        items: [
          { text: 'Text input', link: '/components/input' },
          { text: 'Select', link: '/components/select' },
          { text: 'Checkbox and switch', link: '/components/checkbox' },
          { text: 'Radio and checkbox groups', link: '/components/groups' },
          { text: 'Date picker', link: '/components/date' },
          { text: 'Time picker', link: '/components/time' },
          { text: 'Code / PIN', link: '/components/pin' },
          { text: 'Form and validation', link: '/components/form' },
        ],
      },
      {
        text: 'Other components',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Dialog and drawer', link: '/components/dialog' },
          { text: 'Toasts and confirm', link: '/components/feedback' },
        ],
      },
    ],
  },
})
