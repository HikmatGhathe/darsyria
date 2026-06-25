'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {uploadListingDocument} from '@/lib/verification';

type Props = {
  propertyId: string;
  initialStatus: string; // unverified | pending | verified | rejected
  initialRejectionReason: string | null;
  sellerAccountType: string | null;
};

// Per-listing ownership verification for INDIVIDUAL sellers. Company-owned
// listings derive trust from the company's own verification, so this renders
// nothing for them.
export default function ListingVerificationCard({
  propertyId,
  initialStatus,
  initialRejectionReason,
  sellerAccountType
}: Props) {
  const t = useTranslations('Verification');
  const [status, setStatus] = useState(initialStatus);
  const [rejectionReason] = useState(initialRejectionReason);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (sellerAccountType === 'company') return null;

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const res = await uploadListingDocument(propertyId, file);
      setStatus(res.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('uploadError'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const canUpload = status === 'unverified' || status === 'rejected';

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-1">{t('listingTitle')}</h2>
      <p className="text-sm text-text-secondary mb-4">{t('listingIntro')}</p>

      {status === 'verified' && (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-accent-verified">
          <span aria-hidden="true">✓</span>
          {t('statusListingVerified')}
        </p>
      )}

      {status === 'pending' && <p className="text-sm text-accent-warning">{t('statusPending')}</p>}

      {status === 'rejected' && rejectionReason && (
        <p className="text-sm text-accent-danger mb-3">
          <span className="font-medium">{t('statusRejected')}:</span> {rejectionReason}
        </p>
      )}

      {canUpload && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
            className="block w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-navy file:text-white file:font-medium hover:file:bg-brand-navy-hover file:cursor-pointer disabled:opacity-50"
          />
          <p className="text-xs text-text-tertiary">{t('accepted')}</p>
          {uploading && <p className="text-sm text-text-secondary">{t('uploading')}</p>}
          {error && <p className="text-sm text-accent-danger">{error}</p>}
        </div>
      )}
    </section>
  );
}
