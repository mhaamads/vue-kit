// Ported from portal-iq-vue file-icon-type (icon and tile-colour maps wait for attachments, v1.x).

export const isImageFile = (filename: string) =>
  /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(filename)

const videoMimes: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  mov: 'video/quicktime',
}

export const getVideoMime = (filename: string): string | undefined =>
  videoMimes[filename.split('.').pop()?.toLowerCase() ?? '']

// Created on first use, so importing this module never touches `document`.
let videoProbe: HTMLVideoElement | undefined

/** Asks the browser itself, so .mov plays where supported. */
export const isPlayableVideo = (filename: string) => {
  const mime = getVideoMime(filename)
  return !!mime && !!(videoProbe ??= document.createElement('video')).canPlayType(mime)
}

export const isPreviewableFile = (filename: string) =>
  isImageFile(filename) || isPlayableVideo(filename)
