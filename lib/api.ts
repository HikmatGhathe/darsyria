/**
 * Minimal API client for the DarSyria backend.
 *
 * - Base URL is configurable via NEXT_PUBLIC_API_URL (set in .env.local)
 * - Attaches the stored JWT to every request if present
 * - Throws ApiError on non-2xx responses for the caller to handle
 *
 * TODO for production: replace localStorage JWT storage with httpOnly cookies.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const TOKEN_STORAGE_KEY = 'darsyria_access_token';

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  authenticated?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {method = 'GET', body, authenticated = true} = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (authenticated) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

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
