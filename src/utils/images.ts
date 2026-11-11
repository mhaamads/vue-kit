// Ported from portal-iq-vue image-utils (previewImage stays out: it needs the lightbox, ADR-0010).

// Neutral slate tones read well on light and dark themes (an <img> SVG can't see page CSS).
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="318" height="178" rx="10" fill="#94a3b8" fill-opacity=".12" stroke-dasharray="6 6"/><g transform="translate(136 40)"><rect x="4" y="6" width="40" height="32" rx="4"/><circle cx="17" cy="19" r="4"/><path d="M4 34l12-10 9 8 6-5 13 11"/><path d="M0 0l48 48"/></g><text x="160" y="124" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#94a3b8" stroke="none">Image unavailable</text></svg>`

export const BROKEN_IMAGE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`

/** A clean http(s) URL, or null when the input isn't a usable image link. */
export const normalizeImageUrl = (input: string | null | undefined): string | null => {
  const value = input?.trim()
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** Swaps a failed image for the placeholder, once; the real link stays in `data-original-src`. */
export const markImageBroken = (img: HTMLImageElement) => {
  if (img.dataset.broken) return
  img.dataset.broken = 'true'
  img.dataset.originalSrc = img.getAttribute('src') ?? ''
  img.src = BROKEN_IMAGE_SRC
}
