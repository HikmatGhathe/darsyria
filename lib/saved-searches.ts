import {apiRequest} from './api';

// Decimal fields come back as strings from the API.
export type SavedSearch = {
  id: string;
  city: string | null;
  property_type: string | null;
  min_price: string | null;
  max_price: string | null;
  rooms: number | null;
  seller: string | null;
  label: string;
  created_at: string;
};

export type SavedSearchInput = {
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  rooms?: number;
  seller?: string;
};

export async function listSavedSearches(): Promise<SavedSearch[]> {
  return apiRequest<SavedSearch[]>('/saved-searches', {method: 'GET', authenticated: true});
}

export async function createSavedSearch(input: SavedSearchInput): Promise<SavedSearch> {
  return apiRequest<SavedSearch>('/saved-searches', {
    method: 'POST',
    body: input,
    authenticated: true
  });
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiRequest<void>(`/saved-searches/${id}`, {method: 'DELETE', authenticated: true});
}

// Build the browse URL that re-runs a saved search's criteria.
export function savedSearchHref(locale: string, s: SavedSearch): string {
  const params = new URLSearchParams();
  if (s.city) params.set('city', s.city);
  if (s.property_type) params.set('property_type', s.property_type);
  if (s.min_price) params.set('min_price', s.min_price);
  if (s.max_price) params.set('max_price', s.max_price);
  if (s.rooms != null) params.set('rooms', String(s.rooms));
  if (s.seller) params.set('seller', s.seller);
  const qs = params.toString();
  return `/${locale}/properties${qs ? `?${qs}` : ''}`;
}
