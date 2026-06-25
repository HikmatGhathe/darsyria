import {apiRequest} from './api';
import type {ApiPropertyListItem} from './properties';

export async function listFavorites(): Promise<ApiPropertyListItem[]> {
  return apiRequest<ApiPropertyListItem[]>('/favorites', {
    method: 'GET',
    authenticated: true
  });
}

export async function listFavoriteIds(): Promise<string[]> {
  return apiRequest<string[]>('/favorites/ids', {
    method: 'GET',
    authenticated: true
  });
}

export async function addFavorite(propertyId: string): Promise<void> {
  await apiRequest<void>(`/properties/${propertyId}/favorite`, {
    method: 'POST',
    authenticated: true
  });
}

export async function removeFavorite(propertyId: string): Promise<void> {
  await apiRequest<void>(`/properties/${propertyId}/favorite`, {
    method: 'DELETE',
    authenticated: true
  });
}
