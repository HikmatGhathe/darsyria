'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  AdminUserListItem,
  adminListUsers,
  adminBanUser,
  adminUnbanUser,
  adminPromoteUser,
  adminDemoteUser,
} from '@/lib/admin';

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ isAdmin, t }: { isAdmin: boolean; t: (k: string) => string }) {
  if (!isAdmin) return null;
  return (
    <span className="inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs font-semibold text-purple-800">
      {t('badgeAdmin')}
    </span>
  );
}

function StatusBadge({
  isBanned,
  t,
}: {
  isBanned: boolean;
  t: (k: string) => string;
}) {
  if (isBanned) {
    return (
      <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-800">
        {t('badgeBanned')}
      </span>
    );
  }
  return (
    <span className="inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-800">
      {t('badgeActive')}
    </span>
  );
}

// ── Ban modal ─────────────────────────────────────────────────────────────────

function BanModal({
  user,
  onClose,
  onBanned,
  t,
}: {
  user: AdminUserListItem;
  onClose: () => void;
  onBanned: (updated: AdminUserListItem) => void;
  t: (k: string, vals?: Record<string, string>) => string;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleBan() {
    if (reason.trim().length < 10) return;
    setBusy(true);
    setError('');
    try {
      const updated = await adminBanUser(user.id, reason.trim());
      onBanned(updated);
    } catch {
      setError(t('banModalError'));
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{t('banModalTitle')}</h2>
        <p className="mt-1 text-sm text-gray-500">{t('banModalSubject', { email: user.email })}</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">{t('banModalReason')}</label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('banModalReasonPlaceholder')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {reason.trim().length < 10 && reason.length > 0 && (
            <p className="mt-1 text-xs text-red-600">{t('banModalMinChars')}</p>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('banModalCancel')}
          </button>
          <button
            onClick={handleBan}
            disabled={busy || reason.trim().length < 10}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? t('banModalSending') : t('banModalSend')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm modal (promote / demote) ──────────────────────────────────────────

function ConfirmModal({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  danger,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function handle() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{body}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handle}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User row ──────────────────────────────────────────────────────────────────

function UserRow({
  user,
  isSelf,
  busyRowId,
  onBanClick,
  onUnban,
  onPromoteClick,
  onDemoteClick,
  t,
}: {
  user: AdminUserListItem;
  isSelf: boolean;
  busyRowId: string | null;
  onBanClick: (u: AdminUserListItem) => void;
  onUnban: (u: AdminUserListItem) => void;
  onPromoteClick: (u: AdminUserListItem) => void;
  onDemoteClick: (u: AdminUserListItem) => void;
  t: (k: string) => string;
}) {
  const isBanned = !user.is_active;
  const busy = busyRowId === user.id;

  function fmt(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900">
              {user.full_name || '—'}
            </span>
            {isSelf && (
              <span className="inline-block rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-800">
                {t('badgeYou')}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{user.email}</span>
          {isBanned && user.ban_reason && (
            <span className="mt-0.5 text-xs text-red-600 italic">
              {user.ban_reason}
            </span>
          )}
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <RoleBadge isAdmin={user.is_admin} t={t} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge isBanned={isBanned} t={t} />
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-sm text-gray-600">{fmt(user.created_at)}</td>

      {/* Listings */}
      <td className="px-4 py-3 text-sm text-gray-600">{user.active_listings_count}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {/* Ban / Unban */}
          {isBanned ? (
            <button
              onClick={() => onUnban(user)}
              disabled={busy || isSelf}
              className="rounded bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40"
            >
              {t('actionUnban')}
            </button>
          ) : (
            <button
              onClick={() => onBanClick(user)}
              disabled={busy || isSelf}
              className="rounded bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {t('actionBan')}
            </button>
          )}

          {/* Promote / Demote */}
          {user.is_admin ? (
            <button
              onClick={() => onDemoteClick(user)}
              disabled={busy || isSelf}
              className="rounded bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-40"
            >
              {t('actionDemote')}
            </button>
          ) : (
            <button
              onClick={() => onPromoteClick(user)}
              disabled={busy || isSelf || isBanned}
              className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {t('actionPromote')}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const tAdmin = useTranslations('Admin');
  const t = useTranslations('Admin.users');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [bannedOnly, setBannedOnly] = useState(false);
  const [adminsOnly, setAdminsOnly] = useState(false);

  // Pagination
  const [offset, setOffset] = useState(0);

  // Busy / error
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  // Modals
  const [banTarget, setBanTarget] = useState<AdminUserListItem | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<AdminUserListItem | null>(null);
  const [demoteTarget, setDemoteTarget] = useState<AdminUserListItem | null>(null);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  async function load(searchVal: string, banned: boolean, admins: boolean, off: number) {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminListUsers({
        search: searchVal || undefined,
        banned_only: banned || undefined,
        admins_only: admins || undefined,
        limit: PAGE_SIZE,
        offset: off,
      });
      setUsers(data);
    } catch {
      setLoadError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    if (!authLoading && user?.is_admin) {
      load(search, bannedOnly, adminsOnly, offset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Debounced search
  function handleSearchChange(val: string) {
    setSearch(val);
    setOffset(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(val, bannedOnly, adminsOnly, 0);
    }, 400);
  }

  function handleFilterChange(
    newBanned: boolean,
    newAdmins: boolean,
  ) {
    setBannedOnly(newBanned);
    setAdminsOnly(newAdmins);
    setOffset(0);
    load(search, newBanned, newAdmins, 0);
  }

  function handlePageChange(newOffset: number) {
    setOffset(newOffset);
    load(search, bannedOnly, adminsOnly, newOffset);
  }

  // ── Unban (no modal) ──────────────────────────────────────────────────────
  async function handleUnban(u: AdminUserListItem) {
    setBusyRowId(u.id);
    setActionError('');
    try {
      const updated = await adminUnbanUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      setActionError(t('actionError'));
    } finally {
      setBusyRowId(null);
    }
  }

  // ── Ban (via modal) ───────────────────────────────────────────────────────
  function handleBanned(updated: AdminUserListItem) {
    setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setBanTarget(null);
  }

  // ── Promote (via confirm modal) ───────────────────────────────────────────
  async function handlePromote() {
    if (!promoteTarget) return;
    setBusyRowId(promoteTarget.id);
    setActionError('');
    try {
      const updated = await adminPromoteUser(promoteTarget.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      setActionError(t('actionError'));
    } finally {
      setBusyRowId(null);
      setPromoteTarget(null);
    }
  }

  // ── Demote (via confirm modal) ────────────────────────────────────────────
  async function handleDemote() {
    if (!demoteTarget) return;
    setBusyRowId(demoteTarget.id);
    setActionError('');
    try {
      const updated = await adminDemoteUser(demoteTarget.id);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      setActionError(t('actionError'));
    } finally {
      setBusyRowId(null);
      setDemoteTarget(null);
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return <p className="p-8 text-center text-gray-500">{tAdmin('loading')}</p>;
  }
  if (!user) return null;
  if (!user.is_admin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-gray-600">{tAdmin('accessDenied')}</p>
      </div>
    );
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const start = offset + 1;
  const end = offset + users.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" dir={dir}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            {tAdmin('pageTitle')}
          </Link>
          <span>/</span>
          <span>{t('pageTitle')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('filterSearchPlaceholder')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          aria-label={t('filterSearch')}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={bannedOnly}
            onChange={(e) => handleFilterChange(e.target.checked, adminsOnly)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          {t('filterBannedOnly')}
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={adminsOnly}
            onChange={(e) => handleFilterChange(bannedOnly, e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t('filterAdminsOnly')}
        </label>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">{t('colUser')}</th>
              <th className="px-4 py-3">{t('colRole')}</th>
              <th className="px-4 py-3">{t('colStatus')}</th>
              <th className="px-4 py-3">{t('colJoined')}</th>
              <th className="px-4 py-3">{t('colListings')}</th>
              <th className="px-4 py-3">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  {t('loading')}
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-red-600">
                  {loadError}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={u.id === user.id}
                  busyRowId={busyRowId}
                  onBanClick={setBanTarget}
                  onUnban={handleUnban}
                  onPromoteClick={setPromoteTarget}
                  onDemoteClick={setDemoteTarget}
                  t={(k) => t(k as Parameters<typeof t>[0])}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{t('showingPage', { start: String(start), end: String(end) })}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => handlePageChange(offset + PAGE_SIZE)}
              disabled={users.length < PAGE_SIZE}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Ban modal */}
      {banTarget && (
        <BanModal
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onBanned={handleBanned}
          t={(k, vals) => t(k as Parameters<typeof t>[0], vals as Record<string, string>)}
        />
      )}

      {/* Promote confirm modal */}
      {promoteTarget && (
        <ConfirmModal
          title={t('promoteModalTitle')}
          body={t('promoteModalBody', { email: promoteTarget.email })}
          confirmLabel={t('promoteModalConfirm')}
          cancelLabel={t('promoteModalCancel')}
          onConfirm={handlePromote}
          onClose={() => setPromoteTarget(null)}
        />
      )}

      {/* Demote confirm modal */}
      {demoteTarget && (
        <ConfirmModal
          title={t('demoteModalTitle')}
          body={t('demoteModalBody', { email: demoteTarget.email })}
          confirmLabel={t('demoteModalConfirm')}
          cancelLabel={t('demoteModalCancel')}
          onConfirm={handleDemote}
          onClose={() => setDemoteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
