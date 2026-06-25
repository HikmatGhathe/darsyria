import {apiRequest, API_BASE_URL} from './api';

// ── Types ─────────────────────────────────────────────────────────────────

export type VerificationMe = {
  account_type: string | null;
  verification_status: string; // unverified | pending | verified
  has_company_document: boolean;
};

export type DocumentUploadResponse = {
  document_id: string;
  kind: string;
  status: string;
};

export type AdminPresignedDocument = {
  document_id: string;
  original_filename: string | null;
  content_type: string;
  size_bytes: number;
  created_at: string;
  url: string;
};

export type AdminListingVerificationItem = {
  property_id: string;
  title: string;
  owner_id: string;
  owner_email: string;
  verification_status: string;
  document_count: number;
  submitted_at: string | null;
};

// ── Multipart upload (cookie-auth, accepts 200/201) ─────────────────────────

function uploadDocument(path: string, file: File): Promise<DocumentUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}${path}`);
    xhr.withCredentials = true;
    xhr.timeout = 60000;

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        let detail = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.detail) detail = body.detail;
        } catch {
          // keep generic message
        }
        reject(new Error(detail));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

// ── Seller-facing ───────────────────────────────────────────────────────────

export async function getMyVerification(): Promise<VerificationMe> {
  return apiRequest<VerificationMe>('/verification/me', {
    method: 'GET',
    authenticated: true
  });
}

export async function uploadCompanyDocument(file: File): Promise<DocumentUploadResponse> {
  return uploadDocument('/verification/company/documents', file);
}

export async function uploadListingDocument(
  propertyId: string,
  file: File
): Promise<DocumentUploadResponse> {
  return uploadDocument(`/verification/listings/${propertyId}/documents`, file);
}

// ── Admin: company verification ─────────────────────────────────────────────

export async function getCompanyVerificationDocuments(
  userId: string
): Promise<AdminPresignedDocument[]> {
  return apiRequest<AdminPresignedDocument[]>(
    `/admin/users/${userId}/verification/documents`,
    {method: 'GET', authenticated: true}
  );
}

export async function rejectCompanyVerification(
  userId: string,
  reason?: string
): Promise<void> {
  await apiRequest(`/admin/users/${userId}/verification/reject`, {
    method: 'POST',
    authenticated: true,
    body: {reason: reason ?? null}
  });
}

// ── Admin: listing verification ─────────────────────────────────────────────

export async function getPendingListingVerifications(): Promise<
  AdminListingVerificationItem[]
> {
  return apiRequest<AdminListingVerificationItem[]>(
    '/admin/properties/verification/pending',
    {method: 'GET', authenticated: true}
  );
}

export async function getListingVerificationDocuments(
  propertyId: string
): Promise<AdminPresignedDocument[]> {
  return apiRequest<AdminPresignedDocument[]>(
    `/admin/properties/${propertyId}/verification/documents`,
    {method: 'GET', authenticated: true}
  );
}

export async function approveListingVerification(propertyId: string): Promise<void> {
  await apiRequest(`/admin/properties/${propertyId}/verification/approve`, {
    method: 'POST',
    authenticated: true
  });
}

export async function rejectListingVerification(
  propertyId: string,
  reason?: string
): Promise<void> {
  await apiRequest(`/admin/properties/${propertyId}/verification/reject`, {
    method: 'POST',
    authenticated: true,
    body: {reason: reason ?? null}
  });
}
