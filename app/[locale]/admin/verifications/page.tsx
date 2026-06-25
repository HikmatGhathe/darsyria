'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {adminListUsers, adminVerifyUser, type AdminUserListItem} from '@/lib/admin';
import {
  getCompanyVerificationDocuments,
  rejectCompanyVerification,
  getPendingListingVerifications,
  getListingVerificationDocuments,
  approveListingVerification,
  rejectListingVerification,
  type AdminPresignedDocument,
  type AdminListingVerificationItem
} from '@/lib/verification';

type Tab = 'companies' | 'listings';

export default function AdminVerificationsPage() {
  const t = useTranslations('Admin.verifications');
  const tAdmin = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading} = useAuth();

  const [tab, setTab] = useState<Tab>('companies');
  const [companies, setCompanies] = useState<AdminUserListItem[]>([]);
  const [listings, setListings] = useState<AdminListingVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/${locale}/login?next=/admin/verifications`);
  }, [isLoading, user, locale, router]);

  const load = useCallback(async () => {
    if (!user?.is_admin) return;
    setLoading(true);
    setError(false);
    try {
      if (tab === 'companies') {
        const users = await adminListUsers({pending_verification_only: true});
        setCompanies(users.filter((u: AdminUserListItem) => u.account_type === 'company'));
      } else {
        setListings(await getPendingListingVerifications());
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user, tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDocs(docs: Promise<AdminPresignedDocument[]>) {
    try {
      const list = await docs;
      if (list.length === 0) {
        alert(t('noDocuments'));
        return;
      }
      list.forEach((d) => window.open(d.url, '_blank', 'noopener,noreferrer'));
    } catch {
      setError(true);
    }
  }

  async function approveCompany(id: string) {
    await adminVerifyUser(id);
    setCompanies((prev) => prev.filter((u) => u.id !== id));
  }
  async function rejectCompany(id: string) {
    const reason = window.prompt(t('rejectReasonPrompt')) ?? undefined;
    await rejectCompanyVerification(id, reason);
    setCompanies((prev) => prev.filter((u) => u.id !== id));
  }
  async function approveListing(id: string) {
    await approveListingVerification(id);
    setListings((prev) => prev.filter((l) => l.property_id !== id));
  }
  async function rejectListing(id: string) {
    const reason = window.prompt(t('rejectReasonPrompt')) ?? undefined;
    await rejectListingVerification(id, reason);
    setListings((prev) => prev.filter((l) => l.property_id !== id));
  }

  if (isLoading) {
    return <main className="max-w-5xl mx-auto px-4 py-8 text-sm text-text-secondary">{tAdmin('loading')}</main>;
  }
  if (!user) return null;
  if (!user.is_admin) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{tAdmin('accessDenied')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-brand-navy hover:underline mb-2 inline-block">
        ← {tAdmin('backToDashboard')}
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-text-secondary mb-6">{t('subtitle')}</p>

      <div className="flex gap-2 mb-6 border-b border-border-subtle">
        {(['companies', 'listings'] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === tb
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            {t(tb === 'companies' ? 'tabCompanies' : 'tabListings')}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg mb-4">
          <p className="text-sm text-accent-danger">{t('loadError')}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">{tAdmin('loading')}</p>
      ) : tab === 'companies' ? (
        companies.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('emptyCompanies')}</p>
        ) : (
          <ul className="space-y-3">
            {companies.map((c) => (
              <li
                key={c.id}
                className="bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {c.company_name || c.email}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDocs(getCompanyVerificationDocuments(c.id))}
                    className="px-3 py-1.5 text-sm border border-border-subtle rounded-lg hover:bg-surface-page"
                  >
                    {t('viewDocuments')}
                  </button>
                  <button
                    onClick={() => approveCompany(c.id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-accent-verified rounded-lg hover:opacity-90"
                  >
                    {t('approve')}
                  </button>
                  <button
                    onClick={() => rejectCompany(c.id)}
                    className="px-3 py-1.5 text-sm font-medium text-accent-danger border border-accent-danger/30 rounded-lg hover:bg-accent-danger-bg"
                  >
                    {t('reject')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : listings.length === 0 ? (
        <p className="text-sm text-text-secondary">{t('emptyListings')}</p>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.property_id}
              className="bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{l.title}</p>
                <p className="text-xs text-text-tertiary truncate">
                  {l.owner_email} · {t('documentCount', {count: l.document_count})}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDocs(getListingVerificationDocuments(l.property_id))}
                  className="px-3 py-1.5 text-sm border border-border-subtle rounded-lg hover:bg-surface-page"
                >
                  {t('viewDocuments')}
                </button>
                <button
                  onClick={() => approveListing(l.property_id)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-accent-verified rounded-lg hover:opacity-90"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => rejectListing(l.property_id)}
                  className="px-3 py-1.5 text-sm font-medium text-accent-danger border border-accent-danger/30 rounded-lg hover:bg-accent-danger-bg"
                >
                  {t('reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
