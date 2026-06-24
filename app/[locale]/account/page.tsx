'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {deleteMyAccount, exportMyData, updateMe} from '@/lib/auth';

type FormState = {
  full_name: string;
  phone: string;
  locale: string;
};

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function AccountPage() {
  const t = useTranslations('Account');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading, refresh} = useAuth();

  const [form, setForm] = useState<FormState>({
    full_name: '',
    phone: '',
    locale: 'en',
  });
  const [status, setStatus] = useState<Status>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [exportError, setExportError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // Populate form once user loads
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        locale: user.locale ?? locale,
      });
    }
  }, [user, locale]);

  // Redirect to login if not signed in
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const {name, value} = e.target;
    setForm((prev) => ({...prev, [name]: value}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'saving') return;

    setStatus('saving');
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

    try {
      await updateMe({
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        locale: form.locale as 'en' | 'de' | 'ar',
      });
      await refresh();
      setStatus('saved');
      savedTimerRef.current = setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    }
  }

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(false);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'darsyria-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(true);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(false);
    try {
      await deleteMyAccount();
      await refresh();
      router.push('/');
    } catch {
      setDeleteError(true);
      setIsDeleting(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center text-text-secondary">
        {t('loading')}
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">{t('pageTitle')}</h1>
      <p className="text-text-secondary mb-8">{t('subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Email — read-only */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-lg border border-border-subtle bg-surface-page px-3 py-2 text-sm text-text-tertiary cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-text-tertiary">{t('emailHelp')}</p>
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-text-secondary mb-1">
            {t('fullName')}
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            placeholder={t('fullNamePlaceholder')}
            autoComplete="name"
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          />
          <p className="mt-1 text-xs text-text-tertiary">{t('fullNameHelp')}</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
            {t('phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder={t('phonePlaceholder')}
            autoComplete="tel"
            className="w-full rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-text-tertiary">{t('phoneHelp')}</p>
        </div>

        {/* Language preference */}
        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-text-secondary mb-1">
            {t('language')}
          </label>
          <select
            id="locale"
            name="locale"
            value={form.locale}
            onChange={handleChange}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy bg-surface-card"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
          </select>
          <p className="mt-1 text-xs text-text-tertiary">{t('languageHelp')}</p>
        </div>

        {/* Feedback messages */}
        {status === 'saved' && (
          <p className="text-sm text-accent-verified bg-accent-verified-bg border border-accent-verified/30 rounded-lg px-3 py-2">
            {t('savedSuccess')}
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-accent-danger bg-accent-danger-bg border border-accent-danger/30 rounded-lg px-3 py-2">
            {t('saveError')}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-hover disabled:opacity-60 transition-colors"
        >
          {status === 'saving' ? t('saving') : t('save')}
        </button>
      </form>

      {/* Data export + account deletion */}
      <div className="mt-12 pt-8 border-t border-border-subtle space-y-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          {t('dataSection')}
        </h2>

        <div>
          <h3 className="text-base font-medium text-text-primary mb-1">{t('dataExportHeading')}</h3>
          <p className="text-sm text-text-secondary mb-3">{t('dataExportBody')}</p>
          {exportError && (
            <p className="text-sm text-accent-danger mb-3">{t('dataExportError')}</p>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg border border-border-subtle bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-page disabled:opacity-60 transition-colors"
          >
            {t('dataExportButton')}
          </button>
        </div>

        <div>
          <h3 className="text-base font-medium text-accent-danger mb-1">{t('deleteAccountHeading')}</h3>
          <p className="text-sm text-text-secondary mb-3">{t('deleteAccountBody')}</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-accent-danger/40 bg-surface-card px-4 py-2 text-sm font-medium text-accent-danger hover:bg-accent-danger-bg transition-colors"
          >
            {t('deleteAccountButton')}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-surface-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('deleteAccountConfirmTitle')}
            </h3>
            <p className="text-sm text-text-secondary mb-4">{t('deleteAccountConfirmBody')}</p>
            {deleteError && (
              <p className="text-sm text-accent-danger mb-4">{t('deleteAccountError')}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed transition-colors"
              >
                {t('deleteAccountCancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-accent-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isDeleting ? t('deleting') : t('deleteAccountConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
