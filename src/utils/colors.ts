// Ported from portal-iq-vue color-utils.

type Rgb = { r: number; g: number; b: number }

export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const value = hex.replace('#', '')
  const r = parseInt(value.substring(0, 2), 16) / 255
  const g = parseInt(value.substring(2, 4), 16) / 255
  const b = parseInt(value.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }

  return { h, s: s * 100, l: l * 100 }
}

export const hslToCss = ({ h, s, l }: { h: number; s: number; l: number }): string =>
  `hsl(${h}, ${s}%, ${l}%)`

/** Appends an alpha byte: `#BE242A` at 20 → `#BE242A33`. (portal: `lightenHexByPercentage`) */
export const hexWithOpacity = (hex: string, percentage: number): string => {
  const p = Math.min(100, Math.max(0, percentage))
  return `${hex}${Math.round((p / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}`
}

// The kit's dark surface colour; text on it needs WCAG AA contrast.
const DARK_SURFACE: Rgb = { r: 37, g: 42, b: 46 }
const MIN_CONTRAST = 4.5

const normalizeHex = (hex?: string): string | undefined => {
  const value = hex?.trim().replace('#', '') ?? ''
  if (/^[\da-f]{3}$/i.test(value))
    return `#${[...value]
      .map((c) => c + c)
      .join('')
      .toUpperCase()}`
  if (/^[\da-f]{6,8}$/i.test(value)) return `#${value.slice(0, 6).toUpperCase()}`
}

const toRgb = (hex: string): Rgb => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

const toHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`

const luminance = ({ r, g, b }: Rgb) => {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * A user-picked colour that stays readable as text. Light theme: unchanged.
 * Dark theme: mixed with white in 5% steps until it reaches 4.5:1 on the dark surface.
 */
export const getVisibleColorForTheme = (
  hexColor?: string,
  theme?: 'light' | 'dark',
): string | undefined => {
  if (theme !== 'dark') return hexColor
  const hex = normalizeHex(hexColor)
  if (!hex) return hexColor

  const rgb = toRgb(hex)
  if (contrast(rgb, DARK_SURFACE) >= MIN_CONTRAST) return hex

  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const mixed = {
      r: rgb.r + (255 - rgb.r) * amount,
      g: rgb.g + (255 - rgb.g) * amount,
      b: rgb.b + (255 - rgb.b) * amount,
    }
    if (contrast(mixed, DARK_SURFACE) >= MIN_CONTRAST) return toHex(mixed)
  }
  return '#D7DCE0'
}
