'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {
  adminListReports,
  adminResolveReport,
  adminDismissReport,
  type AdminReportItem
} from '@/lib/admin';

type Status = 'open' | 'resolved' | 'dismissed';

export default function AdminReportsPage() {
  const t = useTranslations('Admin.reports');
  const tReason = useTranslations('Report.reasons');
  const tAdmin = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading} = useAuth();

  const [status, setStatus] = useState<Status>('open');
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/${locale}/login?next=/admin/reports`);
  }, [isLoading, user, locale, router]);

  useEffect(() => {
    if (!user?.is_admin) return;
    let cancelled = false;
    setLoading(true);
    adminListReports(status)
      .then((d) => {
        if (!cancelled) setReports(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, status]);

  async function act(id: string, action: 'resolve' | 'dismiss') {
    setActionError(false);
    setReports((prev) => prev.filter((r) => r.id !== id)); // optimistic (current filter is by status)
    try {
      if (action === 'resolve') await adminResolveReport(id);
      else await adminDismissReport(id);
    } catch (e) {
      console.error('Report action failed:', e);
      setActionError(true);
    }
  }

  if (isLoading) {
    return <main className="max-w-5xl mx-auto px-4 py-8 text-sm text-text-secondary">{t('loading')}</main>;
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

  const STATUSES: Status[] = ['open', 'resolved', 'dismissed'];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-text-secondary mb-6">{t('subtitle')}</p>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? 'px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-navy text-white'
                : 'px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-page'
            }
          >
            {t(`status${s.charAt(0).toUpperCase()}${s.slice(1)}` as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{t('actionError')}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">{t('loading')}</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 px-6 bg-surface-card border border-border-subtle rounded-xl text-text-secondary">
          {t('empty', {status: t(`status${status.charAt(0).toUpperCase()}${status.slice(1)}` as Parameters<typeof t>[0]).toLowerCase()})}
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const href =
              r.target_type === 'listing'
                ? `/properties/${r.target_id}`
                : `/sellers/${r.target_id}`;
            return (
              <li key={r.id} className="p-4 bg-surface-card border border-border-subtle rounded-xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-accent-danger-bg text-accent-danger border border-accent-danger/30">
                        {tReason(r.reason as Parameters<typeof tReason>[0])}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {r.target_type === 'listing' ? t('targetListing') : t('targetSeller')}
                      </span>
                    </div>
                    <Link href={href} className="text-sm font-semibold text-text-primary hover:text-brand-navy">
                      {r.target_label ?? t('noLabel')}
                    </Link>
                    {r.details && (
                      <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{r.details}</p>
                    )}
                    {r.reporter_email && (
                      <p className="text-xs text-text-tertiary mt-1">
                        {t('reportedBy', {email: r.reporter_email})}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={href}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-card border border-border-subtle text-text-primary hover:bg-surface-page"
                    >
                      {t('view')}
                    </Link>
                    {r.status === 'open' && (
                      <>
                        <button
                          onClick={() => act(r.id, 'resolve')}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-accent-verified text-white hover:opacity-90"
                        >
                          {t('resolve')}
                        </button>
                        <button
                          onClick={() => act(r.id, 'dismiss')}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface-card border border-border-subtle text-text-secondary hover:bg-surface-page"
                        >
                          {t('dismiss')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
