import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..', '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')
const uiFiles = readdirSync(join(root, 'src/ui'), { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(ts|vue)$/.test(f) && f !== 'icon-names.ts')
  .map((f) => ({ file: f, text: read(join('src/ui', f)) }))

describe('RTL guard (ADR-0008)', () => {
  // Physical left/right utilities don't flip with dir="rtl"; use ms/me, ps/pe, start/end instead.
  const physical =
    /(?<![\w-])(?:[a-z0-9-]+:)*(?:-?(?:ml|mr|pl|pr|left|right|scroll-ml|scroll-mr)-[\w./[\]-]+|rounded-(?:[lr]|tl|tr|bl|br)(?:-[\w[\]]+)?|border-[lr](?:-[\w[\]]+)?|text-left|text-right|float-left|float-right)(?![\w-])/g

  it('uses no physical direction classes in src/ui', () => {
    const hits = uiFiles.flatMap(({ file, text }) =>
      [...text.matchAll(physical)].map((m) => `${file}: ${m[0]}`),
    )
    expect(hits).toEqual([])
  })
})

describe('icon names', () => {
  it('match the installed vue-iconsax (re-run scripts/gen-icon-names.mjs after upgrading)', () => {
    const installed = readdirSync(join(root, 'node_modules/vue-iconsax/dist/components/icons'))
      .filter((f) => f.endsWith('.vue.js'))
      .map((f) => f.slice(0, -'.vue.js'.length))
      .sort()
    const typed = [...read('src/ui/icon-names.ts').matchAll(/\| '([^']+)'/g)]
      .map((m) => m[1])
      .sort()
    expect(typed).toEqual(installed)
  })
})

describe('theme.css', () => {
  const css = read('src/theme.css')

  it('defines the dark variant on [data-theme=dark] and points Tailwind at the components', () => {
    expect(css).toContain('@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));')
    expect(css).toContain("@source './ui';")
  })

  it('defines a z-* utility for every ZIndex entry', async () => {
    const { ZIndex } = await import('@moonlinetravel/vue-kit/ui')
    const missing = Object.values(ZIndex).filter((cls) => !css.includes(`@utility ${cls} {`))
    expect(missing).toEqual([])
  })
})
