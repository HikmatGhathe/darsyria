import {apiRequest} from './api';
import type {AuthResponse, Locale, User} from './types';

export type UserUpdate = {
  full_name?: string | null;
  phone?: string | null;
  locale?: string;
};

export async function updateMe(updates: UserUpdate): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'PATCH',
    body: updates,
    authenticated: true,
  });
}

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
  // The backend sets auth cookies directly on this response — nothing
  // for the client to store.
  return apiRequest<AuthResponse>('/auth/magic-link/verify', {
    method: 'POST',
    body: {token},
    authenticated: false
  });
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
  // The backend revokes the refresh token and clears both cookies.
  await apiRequest('/auth/logout', {method: 'POST'});
}
