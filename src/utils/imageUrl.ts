/**
 * Utility to reliably resolve image paths in all production environments,
 * custom domains (including Cloudflare / CDN setups), and local dev servers.
 *
 * Normalizes legacy '/src/assets/images/...' to standard public static '/images/...'.
 */

export const DEFAULT_FALLBACK_IMAGE = '/images/about_outboard_motor_1791036540139.jpg';

export function getSafeImageUrl(url?: string | null, fallback = DEFAULT_FALLBACK_IMAGE): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  const trimmed = url.trim();

  // If using legacy /src/assets/images/... (which Vite only serves in local dev, breaking on custom domains and CDN),
  // convert to standard public /images/...
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/images/');
  }

  // If using /assets/images/..., also map to /images/...
  if (trimmed.startsWith('/assets/images/')) {
    return trimmed.replace('/assets/images/', '/images/');
  }

  return trimmed;
}

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_FALLBACK_IMAGE
) {
  const target = event.target as HTMLImageElement;
  if (target && target.src !== fallback) {
    target.src = fallback;
  }
}
