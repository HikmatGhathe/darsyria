import {apiRequest, clearToken, setToken} from './api';
import type {AuthResponse, Locale, User} from './types';

export async function requestMagicLink(
  email: string,
  locale: Locale
): Promise<void> {
  await apiRequest('/auth/magic-link/request', {
    method: 'POST',
    body: {email, locale},
    authenticated: false
  });
}

export async function verifyMagicLink(token: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/magic-link/verify', {
    method: 'POST',
    body: {token},
    authenticated: false
  });
  setToken(response.access_token);
  return response;
}

export async function startGoogleLogin(locale: Locale): Promise<string> {
  const response = await apiRequest<{authorization_url: string}>(
    `/auth/google/login?locale=${locale}`,
    {method: 'GET', authenticated: false}
  );
  return response.authorization_url;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me', {method: 'GET'});
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', {method: 'POST'});
  } catch {
    // Logout is best-effort; clear local state regardless.
  }
  clearToken();
}
