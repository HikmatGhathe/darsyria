'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {getMyVerification, uploadCompanyDocument} from '@/lib/verification';

type State = 'loading' | 'ready';

// Self-contained: fetches the caller's own verification state and renders
// nothing for non-company accounts, so the account page can drop it in
// unconditionally.
export default function CompanyVerificationCard() {
  const t = useTranslations('Verification');
  const [state, setState] = useState<State>('loading');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('unverified');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const me = await getMyVerification();
      setAccountType(me.account_type);
      setStatus(me.verification_status);
    } catch {
      // leave as unverified; the section just won't show actions
    } finally {
      setState('ready');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const res = await uploadCompanyDocument(file);
      setStatus(res.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('uploadError'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  if (state === 'loading' || accountType !== 'company') return null;

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-1">{t('companyTitle')}</h2>
      <p className="text-sm text-text-secondary mb-4">{t('companyIntro')}</p>

      {status === 'verified' ? (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-accent-verified">
          <span aria-hidden="true">✓</span>
          {t('statusVerifiedCompany')}
        </p>
      ) : status === 'pending' ? (
        <p className="text-sm text-accent-warning">{t('statusPending')}</p>
      ) : (
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
