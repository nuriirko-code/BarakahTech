// Video URL normalization lives in utils rather than a page component because
// multiple lesson views may need the same provider-specific URL conversion.

/**
 * Convert a common YouTube watch/share/embed URL to the iframe embed form.
 * Supported forms include:
 * - youtube.com/watch?v=VIDEO_ID: read the video ID from the v query parameter.
 * - youtu.be/VIDEO_ID: read the ID from the first path segment.
 * - youtube.com/embed/VIDEO_ID: preserve an already embedded video ID.
 * Unknown or invalid URLs are returned unchanged so callers can handle them.
 */
export const getYouTubeEmbedUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return url

  try {
    const parsedUrl = new URL(url)
    const host = parsedUrl.hostname.toLowerCase()
    let videoId = ''

    if (host === 'youtu.be') {
      // Short links put the video ID directly after the hostname.
      videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] || ''
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      if (parsedUrl.pathname === '/watch') {
        // Watch links store the ID in ?v=VIDEO_ID.
        videoId = parsedUrl.searchParams.get('v') || ''
      } else {
        // Embed and Shorts links include the ID as the next path segment.
        const match = parsedUrl.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)
        videoId = match?.[1] || ''
      }
    }

    return videoId
      ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`
      : url
  } catch {
    return url
  }
}

/**
 * Convert Google Drive file links from /file/d/FILE_ID/view to
 * /file/d/FILE_ID/preview, the endpoint intended for iframe display.
 * A non-matching or invalid URL is preserved unchanged for graceful fallback.
 */
export const getGoogleDriveEmbedUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return url

  try {
    const parsedUrl = new URL(url)
    if (!['drive.google.com', 'www.drive.google.com'].includes(parsedUrl.hostname.toLowerCase())) {
      return url
    }

    // Capture the file ID from Google's standard /file/d/FILE_ID/... sharing path.
    const match = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/)
    if (!match) return url

    return `https://drive.google.com/file/d/${encodeURIComponent(match[1])}/preview`
  } catch {
    return url
  }
}
