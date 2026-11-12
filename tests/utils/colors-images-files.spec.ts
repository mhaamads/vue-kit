import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BROKEN_IMAGE_SRC,
  getVideoMime,
  getVisibleColorForTheme,
  hexToHsl,
  hexWithOpacity,
  hslToCss,
  isImageFile,
  isPlayableVideo,
  isPreviewableFile,
  markImageBroken,
  normalizeImageUrl,
} from '@mhaamads/vue-kit/utils'

describe('colors', () => {
  it('converts hex to HSL', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 })
    expect(hexToHsl('808080')).toEqual({ h: 0, s: 0, l: expect.closeTo(50.2, 1) })
  })

  it('formats HSL as CSS', () => {
    expect(hslToCss({ h: 10, s: 20, l: 30 })).toBe('hsl(10, 20%, 30%)')
  })

  it('appends an alpha byte for a percentage, clamped to 0-100 (portal lightenHexByPercentage)', () => {
    expect(hexWithOpacity('#BE242A', 20)).toBe('#BE242A33')
    expect(hexWithOpacity('#BE242A', 150)).toBe('#BE242AFF')
    expect(hexWithOpacity('#BE242A', -5)).toBe('#BE242A00')
  })

  it('returns the colour unchanged outside dark mode', () => {
    expect(getVisibleColorForTheme('#111111', 'light')).toBe('#111111')
    expect(getVisibleColorForTheme('#111111', undefined)).toBe('#111111')
  })

  it('keeps a readable colour in dark mode, normalised to #RRGGBB', () => {
    expect(getVisibleColorForTheme('#fff', 'dark')).toBe('#FFFFFF')
  })

  it('lightens an unreadable colour in dark mode until it reaches 4.5:1 on the dark surface', () => {
    const result = getVisibleColorForTheme('#094a78', 'dark')
    expect(result).toMatch(/^#[0-9A-F]{6}$/)
    expect(result).not.toBe('#094A78')
  })

  it('returns invalid input unchanged', () => {
    expect(getVisibleColorForTheme('red', 'dark')).toBe('red')
  })
})

describe('images (portal image-utils.spec)', () => {
  it('accepts http(s) links and trims them', () => {
    expect(normalizeImageUrl('  https://example.com/a.png ')).toBe('https://example.com/a.png')
    expect(normalizeImageUrl('http://example.com/a.png?x=1')).toBe('http://example.com/a.png?x=1')
  })

  it.each([
    '',
    '   ',
    null,
    undefined,
    'not a url',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'ftp://example.com/a.png',
    '//example.com/a.png',
  ])('rejects %o', (bad) => {
    expect(normalizeImageUrl(bad)).toBeNull()
  })

  it('BROKEN_IMAGE_SRC is a self-contained svg data uri', () => {
    expect(BROKEN_IMAGE_SRC.startsWith('data:image/svg+xml;utf8,')).toBe(true)
    expect(decodeURIComponent(BROKEN_IMAGE_SRC)).toContain('Image unavailable')
  })

  it('markImageBroken swaps in the placeholder once and keeps the original link', () => {
    const img = document.createElement('img')
    img.setAttribute('src', 'https://example.com/gone.png')
    markImageBroken(img)
    markImageBroken(img)
    expect(img.getAttribute('src')).toBe(BROKEN_IMAGE_SRC)
    expect(img.dataset.originalSrc).toBe('https://example.com/gone.png')
  })
})

describe('file types', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    ['photo.JPG', true],
    ['a.webp', true],
    ['doc.pdf', false],
  ])('isImageFile(%s) is %s', (name, expected) => {
    expect(isImageFile(name)).toBe(expected)
  })

  it('maps video extensions to MIME types', () => {
    expect(getVideoMime('clip.MOV')).toBe('video/quicktime')
    expect(getVideoMime('a.txt')).toBeUndefined()
  })

  it('asks the browser whether a video can play', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation((mime) =>
      mime === 'video/mp4' ? 'probably' : '',
    )
    expect(isPlayableVideo('a.mp4')).toBe(true)
    expect(isPlayableVideo('a.mov')).toBe(false)
    expect(isPreviewableFile('a.png')).toBe(true)
    expect(isPreviewableFile('a.zip')).toBe(false)
  })
})
