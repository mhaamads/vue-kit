import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..', '..')
const templates = readdirSync(join(root, 'src/ui'), { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.vue'))
  .map((f) => ({
    file: f,
    text: readFileSync(join(root, 'src/ui', f), 'utf8').split('<script')[0]!,
  }))

describe('headless guard (ADR-0012, ADR-0014)', () => {
  it('finds the components', () => {
    expect(templates.length).toBeGreaterThan(10)
  })

  it('renders no classes of its own: every class comes from the ui map', () => {
    const hits = templates.flatMap(({ file, text }) =>
      [...text.matchAll(/(?<![\w-])(:?class)="([^"]*)"/g)]
        .filter(([, , value]) => !/^ui\.\w+$/.test(value!))
        .map((m) => `${file}: ${m[0]}`),
    )
    expect(hits).toEqual([])
  })

  it('has no <style> blocks', () => {
    expect(templates.filter(({ text }) => text.includes('<style')).map((f) => f.file)).toEqual([])
  })

  it('uses inline styles only for behaviour (dropdowns, windowing, the hidden PIN input)', () => {
    const styled = templates.filter(({ text }) => /:style=/.test(text)).map((f) => f.file)
    expect(styled.sort()).toEqual([
      'inputs/AppPinInput.vue',
      'inputs/AppSelect.vue',
      'inputs/CountryCodeSelect.vue',
    ])
  })
})
