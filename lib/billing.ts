import {apiRequest} from './api';

export type BillingConfig = {
  payment_required: boolean;
  price_amount: string;
  price_currency: string;
};

export type Invoice = {
  id: string;
  property_id: string;
  amount: string;
  currency: string;
  status: string; // unpaid | paid | void
  provider: string;
  created_at: string;
  due_at: string | null;
  paid_at: string | null;
};

export type AdminInvoiceItem = Invoice & {
  property_title: string;
  owner_id: string;
  owner_email: string;
};

// ── Seller-facing ───────────────────────────────────────────────────────────

export async function getBillingConfig(): Promise<BillingConfig> {
  return apiRequest<BillingConfig>('/billing/config', {method: 'GET', authenticated: false});
}

export async function getMyInvoices(): Promise<Invoice[]> {
  return apiRequest<Invoice[]>('/billing/invoices', {method: 'GET', authenticated: true});
}

// ── Admin ───────────────────────────────────────────────────────────────────

export async function getBillingSettings(): Promise<BillingConfig> {
  return apiRequest<BillingConfig>('/admin/billing/settings', {
    method: 'GET',
    authenticated: true
  });
}

export async function updateBillingSettings(
  update: Partial<{payment_required: boolean; price_amount: string; price_currency: string}>
): Promise<BillingConfig> {
  return apiRequest<BillingConfig>('/admin/billing/settings', {
    method: 'PUT',
    authenticated: true,
    body: update
  });
}

export async function getAdminInvoices(status?: string): Promise<AdminInvoiceItem[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest<AdminInvoiceItem[]>(`/admin/billing/invoices${qs}`, {
    method: 'GET',
    authenticated: true
  });
}

export async function markInvoicePaid(id: string): Promise<AdminInvoiceItem> {
  return apiRequest<AdminInvoiceItem>(`/admin/billing/invoices/${id}/mark-paid`, {
    method: 'POST',
    authenticated: true
  });
}

export async function voidInvoice(id: string): Promise<AdminInvoiceItem> {
  return apiRequest<AdminInvoiceItem>(`/admin/billing/invoices/${id}/void`, {
    method: 'POST',
    authenticated: true
  });
}
