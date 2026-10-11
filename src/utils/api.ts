/**
 * Centralized API utility for BlueWave Outboard Motors.
 *
 * Resolves API endpoints against optional VITE_API_URL when the frontend
 * is hosted separately (such as on Cloudflare Pages or a custom domain CDN),
 * while defaulting to relative paths in local development and full-stack environments.
 *
 * Handles HTTP status codes and safely inspects server responses to provide
 * accurate diagnostic error messages instead of masking issues with generic errors.
 */

export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function safeFetchJson<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint);
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // Check if the server returned JSON
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        if (res.ok) {
          return { ok: true, status: res.status, data };
        }
        return {
          ok: false,
          status: res.status,
          error: data?.error || data?.message || `Server returned error (${res.status})`,
          data,
        };
      } catch {
        return {
          ok: false,
          status: res.status,
          error: `Failed to parse JSON response from server (HTTP ${res.status})`,
        };
      }
    }

    // Response was NOT JSON (e.g. HTML 404 page, Cloudflare error, or SPA fallback index.html)
    if (res.status === 404) {
      return {
        ok: false,
        status: 404,
        error:
          'Backend API endpoint not found (HTTP 404). If hosted on Cloudflare Pages, your Node.js backend must be deployed and configured in VITE_API_URL.',
      };
    }

    if (res.status === 502 || res.status === 503) {
      return {
        ok: false,
        status: res.status,
        error: `Backend server is temporarily unavailable or unreachable (HTTP ${res.status}).`,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        status: res.status,
        error: `Authentication failed (HTTP ${res.status}). Please check credentials.`,
      };
    }

    // If Cloudflare Pages returned index.html with 200 OK for a non-existent API route
    if (res.ok && contentType.includes('text/html')) {
      return {
        ok: false,
        status: 404,
        error:
          'API endpoint returned HTML instead of JSON. The backend server is not running on this domain.',
      };
    }

    return {
      ok: false,
      status: res.status,
      error: `Server responded with unexpected status HTTP ${res.status}`,
    };
  } catch (err: any) {
    const msg = err?.message || 'Network request failed';
    return {
      ok: false,
      status: 0,
      error: `Network error: ${msg}. The backend server is unreachable.`,
    };
  }
}
