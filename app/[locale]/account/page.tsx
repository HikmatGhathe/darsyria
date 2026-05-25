'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {updateMe} from '@/lib/auth';

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

  if (isLoading || !user) {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center text-gray-500">
        {t('loading')}
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('pageTitle')}</h1>
      <p className="text-gray-600 mb-8">{t('subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Email — read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">{t('emailHelp')}</p>
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">{t('fullNameHelp')}</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-gray-500">{t('phoneHelp')}</p>
        </div>

        {/* Language preference */}
        <div>
          <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
            {t('language')}
          </label>
          <select
            id="locale"
            name="locale"
            value={form.locale}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">{t('languageHelp')}</p>
        </div>

        {/* Feedback messages */}
        {status === 'saved' && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {t('savedSuccess')}
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {t('saveError')}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {status === 'saving' ? t('saving') : t('save')}
        </button>
      </form>
    </main>
  );
}
