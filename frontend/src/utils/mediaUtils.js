/**
 * mediaUtils.js - Cross-Origin Safe Media Utilities for Pulse Studio & Feeds
 * Prevents CORS blocks, MDN Range Cache failures, and YouTube embedding issues.
 */

export const LOCAL_SAMPLE_VIDEOS = [
  '/sample-videos/sample1.mp4',
  '/sample-videos/sample2.mp4',
  '/sample-videos/sample3.mp4'
];

/**
 * Extracts standard 11-character YouTube video ID from any YouTube URL (shorts, watch, youtu.be, embed)
 */
export function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Returns a high-res, CORS-friendly YouTube thumbnail URL for any YouTube video/shorts URL
 */
export function getYouTubeThumbnail(url, quality = 'hqdefault') {
  const ytId = getYouTubeId(url);
  if (!ytId) return null;
  return `https://img.youtube.com/vi/${ytId}/${quality}.jpg`;
}

/**
 * Resolves a safe, non-broken media stream URL.
 * Replaces broken MDN, Google Storage, or Mixkit links with fast local sample videos.
 */
export function resolveSafeMediaUrl(url, fallbackIdx = 0) {
  const fallback = LOCAL_SAMPLE_VIDEOS[fallbackIdx % LOCAL_SAMPLE_VIDEOS.length];
  if (!url || typeof url !== 'string') return fallback;

  // Check for dead or cache-unsupported external hosts, or YouTube URLs that cannot be played in native <video> tags (triggers CORB)
  if (
    getYouTubeId(url) ||
    url.includes('commondatastorage.googleapis.com') ||
    url.includes('mixkit.co/videos') ||
    url.includes('interactive-examples.mdn.mozilla.net')
  ) {
    return fallback;
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }

  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
}
