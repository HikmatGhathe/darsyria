/**
 * Minimal API client for the DarSyria backend.
 *
 * - Base URL is configurable via NEXT_PUBLIC_API_URL (set in .env.local)
 * - Auth lives in httpOnly cookies set by the backend — never readable
 *   from JS, so credentials: 'include' is all this client needs to do.
 * - On a 401 from an authenticated request, attempts one silent token
 *   refresh and retries the request once before giving up.
 * - Throws ApiError on non-2xx responses for the caller to handle.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  authenticated?: boolean;
};

function doFetch(path: string, method: string, body: unknown): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Dedupe concurrent refresh attempts — if five requests 401 at once, only
// one /auth/refresh call should fire.
let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = doFetch('/auth/refresh', 'POST', undefined)
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, authenticated = true } = options;

  let response = await doFetch(path, method, body);

  if (response.status === 401 && authenticated && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await doFetch(path, method, body);
    }
  }

  let parsed: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status !== 204 && contentType.includes('application/json')) {
    parsed = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(response.status, parsed);
  }

  return parsed as T;
}
