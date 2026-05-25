import { apiRequest } from './api';

// ---------- Types ----------

export type AdminPropertyListItem = {
  id: string;
  owner_id: string;
  owner_email: string | null;
  title: string;
  city: string;
  price_amount: number;
  price_currency: string;
  status: string;
  document_status: string;
  flagged_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  full_name: string | null;
  locale: string;
  is_active: boolean;
  is_admin: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  last_login_at: string | null;
  active_listings_count: number;
};

// ---------- Property admin ----------

export type AdminPropertiesFilters = {
  status?: string;
  flagged_only?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function adminListProperties(
  filters: AdminPropertiesFilters = {}
): Promise<AdminPropertyListItem[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.flagged_only) params.set('flagged_only', 'true');
  if (filters.search) params.set('search', filters.search);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return apiRequest<AdminPropertyListItem[]>(
    `/admin/properties${qs ? `?${qs}` : ''}`,
    { method: 'GET', authenticated: true }
  );
}

export async function adminApproveProperty(id: string): Promise<AdminPropertyListItem> {
  return apiRequest<AdminPropertyListItem>(`/admin/properties/${id}/approve`, {
    method: 'POST',
    authenticated: true,
  });
}

export async function adminRejectProperty(
  id: string,
  reason: string
): Promise<AdminPropertyListItem> {
  return apiRequest<AdminPropertyListItem>(`/admin/properties/${id}/reject`, {
    method: 'POST',
    body: { reason },
    authenticated: true,
  });
}

export async function adminFlagProperty(id: string): Promise<AdminPropertyListItem> {
  return apiRequest<AdminPropertyListItem>(`/admin/properties/${id}/flag`, {
    method: 'POST',
    authenticated: true,
  });
}

export async function adminUnflagProperty(id: string): Promise<AdminPropertyListItem> {
  return apiRequest<AdminPropertyListItem>(`/admin/properties/${id}/unflag`, {
    method: 'POST',
    authenticated: true,
  });
}

// ---------- User admin ----------

export type AdminUsersFilters = {
  search?: string;
  banned_only?: boolean;
  admins_only?: boolean;
  limit?: number;
  offset?: number;
};

export async function adminListUsers(
  filters: AdminUsersFilters = {}
): Promise<AdminUserListItem[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.banned_only) params.set('banned_only', 'true');
  if (filters.admins_only) params.set('admins_only', 'true');
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return apiRequest<AdminUserListItem[]>(
    `/admin/users${qs ? `?${qs}` : ''}`,
    { method: 'GET', authenticated: true }
  );
}

export async function adminBanUser(
  id: string,
  reason: string
): Promise<AdminUserListItem> {
  return apiRequest<AdminUserListItem>(`/admin/users/${id}/ban`, {
    method: 'POST',
    body: { reason },
    authenticated: true,
  });
}

export async function adminUnbanUser(id: string): Promise<AdminUserListItem> {
  return apiRequest<AdminUserListItem>(`/admin/users/${id}/unban`, {
    method: 'POST',
    authenticated: true,
  });
}

export async function adminPromoteUser(id: string): Promise<AdminUserListItem> {
  return apiRequest<AdminUserListItem>(`/admin/users/${id}/promote`, {
    method: 'POST',
    authenticated: true,
  });
}

export async function adminDemoteUser(id: string): Promise<AdminUserListItem> {
  return apiRequest<AdminUserListItem>(`/admin/users/${id}/demote`, {
    method: 'POST',
    authenticated: true,
  });
}
