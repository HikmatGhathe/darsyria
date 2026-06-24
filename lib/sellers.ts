import {apiRequest} from './api';
import type {ApiPropertyListItem} from './properties';

export type SellerProfile = {
  id: string;
  display_name: string | null;
  account_type: string | null;
  verification_status: 'unverified' | 'pending' | 'verified';
  member_since: string;
  active_listing_count: number;
  follower_count: number;
  is_following: boolean;
  is_self: boolean;
  company_about: string | null;
  company_website: string | null;
  company_address: string | null;
  phone: string | null;
  listings: ApiPropertyListItem[];
};

export async function getSeller(id: string): Promise<SellerProfile> {
  return apiRequest<SellerProfile>(`/sellers/${id}`, {
    method: 'GET',
    authenticated: false
  });
}

export async function followSeller(id: string): Promise<void> {
  await apiRequest<void>(`/sellers/${id}/follow`, {
    method: 'POST',
    authenticated: true
  });
}

export async function unfollowSeller(id: string): Promise<void> {
  await apiRequest<void>(`/sellers/${id}/follow`, {
    method: 'DELETE',
    authenticated: true
  });
}
