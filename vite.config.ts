import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' with { type: 'json' }

const entries = ['utils', 'http', 'ui'] as const
const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

// Everything the package depends on stays a bare import in dist; the consumer installs it.
const runtimeDeps = Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies })
const isExternal = (id: string) => runtimeDeps.some((dep) => id === dep || id.startsWith(`${dep}/`))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: Object.fromEntries(entries.map((name) => [`${name}/index`, src(`${name}/index.ts`)])),
      formats: ['es'],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    // Tests use the public entry points only, resolved to source.
    alias: Object.fromEntries(
      entries.map((name) => [`@moonlinetravel/vue-kit/${name}`, src(`${name}/index.ts`)]),
    ),
  },
})
