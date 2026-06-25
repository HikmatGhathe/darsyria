// This module is server-only by construction: importing next/headers in a
// client component is a build error, so it can never leak to the browser.
import {cache} from 'react';
import {cookies} from 'next/headers';
import type {ApiProperty, ApiPropertyListItem, PropertyFilters} from './properties';
import type {SellerProfile} from './sellers';

// Server-side base URL. In dev this is the same localhost:8000 the browser
// uses; in Docker the frontend container reaches the API by service name, so
// INTERNAL_API_URL is set to http://api:8000 there.
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

/**
 * Fetch JSON from the API inside a server component.
 *
 * Forwards the caller's auth cookies so an owner viewing their own listing
 * gets owner context, while an anonymous crawler simply gets the public view.
 * Returns null on 404 so the page can call notFound(); throws on other errors.
 */
export async function serverFetchJson<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const res = await fetch(`${INTERNAL_API_URL}${path}`, {
    headers: cookieHeader ? {cookie: cookieHeader} : {},
    cache: 'no-store'
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Server fetch failed (${res.status}) for ${path}`);
  }
  return (await res.json()) as T;
}

// Wrapped in React cache() so generateMetadata and the page render that both
// need the same resource share a single API call within one request.
export const getPropertyServer = cache(
  (id: string): Promise<ApiProperty | null> =>
    serverFetchJson<ApiProperty>(`/properties/${id}`)
);

export const getSellerServer = cache(
  (id: string): Promise<SellerProfile | null> =>
    serverFetchJson<SellerProfile>(`/sellers/${id}`)
);

// Filter-only params (no sort/limit/offset) — shared by list and count.
function propertyFilterParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.city) params.set('city', filters.city);
  if (filters.property_type) params.set('property_type', filters.property_type);
  if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price));
  if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price));
  if (filters.rooms !== undefined) params.set('rooms', String(filters.rooms));
  if (filters.seller) params.set('seller', filters.seller);
  return params;
}

export async function listPropertiesServer(
  filters: PropertyFilters
): Promise<ApiPropertyListItem[]> {
  const params = propertyFilterParams(filters);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const data = await serverFetchJson<ApiPropertyListItem[]>(
    `/properties${qs ? `?${qs}` : ''}`
  );
  return data ?? [];
}

export async function countPropertiesServer(filters: PropertyFilters): Promise<number> {
  const qs = propertyFilterParams(filters).toString();
  const data = await serverFetchJson<{count: number}>(
    `/properties/count${qs ? `?${qs}` : ''}`
  );
  return data?.count ?? 0;
}
