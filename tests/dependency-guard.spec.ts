import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import pkg from '../package.json' with { type: 'json' }

// ADR-0012 (replaces ADR-0011's list). Changing it needs a new ADR.
// @vuepic/vue-datepicker: the owner chose portal's date picker for AppDateInput (ADR-0015).
const ALLOWED = ['vue', 'maska', '@floating-ui/vue', '@vueuse/core', '@vuepic/vue-datepicker']

const srcDir = join(import.meta.dirname, '..', 'src')
const files = readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(ts|vue)$/.test(f))
  .map((f) => join(srcDir, f))

const packageName = (spec: string) =>
  spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!

const bareImports = files.flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/(?:from\s+|import\s*\(?\s*)['"]([^'"]+)['"]/g)]
    .map((m) => m[1]!)
    .filter((spec) => !spec.startsWith('.'))
    .map((spec) => ({ file, pkg: packageName(spec) })),
)

const declared = Object.keys({ ...pkg.peerDependencies, ...pkg.dependencies })

describe('dependency guard (ADR-0010, ADR-0011)', () => {
  it('finds the source files', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('declares only allow-listed runtime dependencies', () => {
    expect(declared.filter((dep) => !ALLOWED.includes(dep))).toEqual([])
  })

  it('imports only declared, allow-listed packages from src', () => {
    const bad = bareImports.filter(
      ({ pkg: name }) => !ALLOWED.includes(name) || !declared.includes(name),
    )
    expect(bad).toEqual([])
  })
})
