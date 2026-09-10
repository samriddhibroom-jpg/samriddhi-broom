/**
 * Client-side CSRF Token Manager
 * Manages fetching, caching, and attaching CSRF tokens for state-changing requests.
 */

let cachedCsrfToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function fetchCsrfToken(): Promise<string> {
  const now = Date.now();
  // Return cached token if valid for at least 30 more seconds
  if (cachedCsrfToken && tokenExpiresAt > now + 30000) {
    return cachedCsrfToken;
  }

  try {
    const res = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        // Cache for 30 minutes
        tokenExpiresAt = now + 30 * 60 * 1000;
        return cachedCsrfToken;
      }
    }
  } catch {
    // Return cached if available
    if (cachedCsrfToken) return cachedCsrfToken;
  }

  return '';
}

export function clearCsrfToken(): void {
  cachedCsrfToken = null;
  tokenExpiresAt = 0;
}
