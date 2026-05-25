'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  adminListProperties,
  adminApproveProperty,
  adminFlagProperty,
  adminUnflagProperty,
  adminRejectProperty,
  type AdminPropertyListItem,
} from '@/lib/admin';

const PAGE_SIZE = 50;

export default function AdminListingsPage() {
  const t = useTranslations('Admin.listings');
  const tAdmin = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login?next=/admin/listings`);
    }
  }, [authLoading, user, locale, router]);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);

  // Debounce search 400ms
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handle);
  }, [search]);

  // Reset to first page when filters change
  useEffect(() => {
    setOffset(0);
  }, [statusFilter, flaggedOnly, debouncedSearch]);

  // Data state
  const [listings, setListings] = useState<AdminPropertyListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<AdminPropertyListItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.is_admin) return;
    setLoadError(null);
    try {
      const data = await adminListProperties({
        status: statusFilter || undefined,
        flagged_only: flaggedOnly,
        search: debouncedSearch || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setListings(data);
    } catch (err) {
      console.error('Listings load failed:', err);
      setLoadError(t('loadError'));
    }
  }, [user, statusFilter, flaggedOnly, debouncedSearch, offset, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function doAction(rowId: string, action: () => Promise<unknown>) {
    if (busyRowId) return;
    setBusyRowId(rowId);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      console.error('Admin action failed:', err);
      setActionError(t('actionError'));
    } finally {
      setBusyRowId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (reason.length < 10 || rejecting) return;
    setRejecting(true);
    setRejectError(null);
    try {
      await adminRejectProperty(rejectTarget.id, reason);
      setRejectTarget(null);
      setRejectReason('');
      await load();
    } catch (err) {
      console.error('Reject failed:', err);
      setRejectError(t('rejectModalError'));
    } finally {
      setRejecting(false);
    }
  }

  if (authLoading || !user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">{tAdmin('loading')}</p>
      </main>
    );
  }

  if (!user.is_admin) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{tAdmin('accessDenied')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← {tAdmin('pageTitle')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('pageTitle')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('filterSearch')}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('filterSearchPlaceholder')}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('filterStatus')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filterStatusAll')}</option>
            <option value="active">{t('filterStatusActive')}</option>
            <option value="draft">{t('filterStatusDraft')}</option>
            <option value="rejected">{t('filterStatusRejected')}</option>
            <option value="removed">{t('filterStatusRemoved')}</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{t('filterFlaggedOnly')}</span>
        </label>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Table */}
      {loadError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{loadError}</p>
        </div>
      ) : listings === null ? (
        <p className="text-sm text-gray-500">{t('loading')}</p>
      ) : listings.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">{t('empty')}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-700">{t('colTitle')}</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-700 hidden md:table-cell">{t('colOwner')}</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-700">{t('colStatus')}</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">{t('colPrice')}</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">{t('colCreated')}</th>
                  <th className="text-end px-4 py-3 font-medium text-gray-700">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((p) => (
                  <ListingRow
                    key={p.id}
                    listing={p}
                    locale={locale}
                    busy={busyRowId === p.id}
                    onApprove={() => doAction(p.id, () => adminApproveProperty(p.id))}
                    onFlag={() => doAction(p.id, () => adminFlagProperty(p.id))}
                    onUnflag={() => doAction(p.id, () => adminUnflagProperty(p.id))}
                    onReject={() => {
                      setRejectTarget(p);
                      setRejectReason('');
                      setRejectError(null);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {listings && listings.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            {t('showingPage', { start: offset + 1, end: offset + listings.length })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={listings.length < PAGE_SIZE}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !rejecting && setRejectTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {t('rejectModalTitle')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('rejectModalSubject', { title: rejectTarget.title })}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('rejectModalReason')}
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('rejectModalReasonPlaceholder')}
              rows={5}
              maxLength={1000}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={rejecting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50"
            />
            <p className={`mt-1 text-xs ${rejectReason.trim().length < 10 ? 'text-amber-600' : 'text-gray-500'}`}>
              {rejectReason.trim().length}/10+ — {t('rejectModalMinChars')}
            </p>
            {rejectError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{rejectError}</p>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                disabled={rejecting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:cursor-not-allowed transition"
              >
                {t('rejectModalCancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectReason.trim().length < 10 || rejecting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {rejecting ? t('rejectModalSending') : t('rejectModalSend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ---------- Row component ----------

function ListingRow({
  listing,
  locale,
  busy,
  onApprove,
  onFlag,
  onUnflag,
  onReject,
}: {
  listing: AdminPropertyListItem;
  locale: string;
  busy: boolean;
  onApprove: () => void;
  onFlag: () => void;
  onUnflag: () => void;
  onReject: () => void;
}) {
  const t = useTranslations('Admin.listings');
  const isFlagged = listing.flagged_at !== null;

  return (
    <tr className={isFlagged ? 'bg-amber-50' : ''}>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">{listing.title}</p>
        {isFlagged && (
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded">
            {t('flagBadge')}
          </span>
        )}
        {listing.rejection_reason && (
          <p className="mt-1 text-xs text-red-700 italic line-clamp-2">
            {t('rejectedBadge', { reason: listing.rejection_reason })}
          </p>
        )}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-xs text-gray-600 break-all">{listing.owner_email ?? '—'}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={listing.status} />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <p className="text-xs text-gray-700">
          {Number(listing.price_amount).toLocaleString()} {listing.price_currency}
        </p>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <p className="text-xs text-gray-500">
          {new Date(listing.created_at).toLocaleDateString(
            locale === 'de' ? 'de-DE' : locale === 'ar' ? 'ar-SY' : 'en-GB'
          )}
        </p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <a
            href={`/${locale}/properties/${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            {t('actionView')}
          </a>
          {isFlagged ? (
            <button
              onClick={onUnflag}
              disabled={busy}
              className="px-2 py-1 text-xs bg-amber-100 border border-amber-300 text-amber-900 rounded hover:bg-amber-200 disabled:opacity-50"
            >
              {t('actionUnflag')}
            </button>
          ) : (
            <button
              onClick={onFlag}
              disabled={busy}
              className="px-2 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {t('actionFlag')}
            </button>
          )}
          <button
            onClick={onApprove}
            disabled={busy || listing.status === 'active'}
            className="px-2 py-1 text-xs bg-white border border-green-300 text-green-700 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('actionApprove')}
          </button>
          <button
            onClick={onReject}
            disabled={busy}
            className="px-2 py-1 text-xs bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
          >
            {t('actionReject')}
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    removed: 'bg-gray-200 text-gray-600 border-gray-300',
  };
  const cls = colors[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border rounded ${cls}`}>
      {status}
    </span>
  );
}
