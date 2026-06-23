'use client';

import {useState} from 'react';
import type {FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {requestMagicLink, startGoogleLogin} from '@/lib/auth';
import type {Locale} from '@/lib/types';

export default function LoginPage() {
  const t = useTranslations('Auth.login');
  const locale = useLocale() as Locale;

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus('idle');
    try {
      await requestMagicLink(email.trim(), locale);
      setStatus('sent');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      const url = await startGoogleLogin(locale);
      window.location.href = url;
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-3 text-text-primary">{t('title')}</h1>
        <p className="text-text-secondary">{t('subtitle')}</p>
      </div>

      {status === 'sent' ? (
        <div className="p-4 bg-accent-verified-bg border border-accent-verified/30 rounded-lg text-accent-verified text-sm">
          {t('magicLinkSent')}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-2 bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="w-full px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? t('sending') : t('sendMagicLink')}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-text-tertiary uppercase tracking-wide">
              {t('orDivider')}
            </span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full px-6 py-3 border border-border-subtle text-text-primary rounded-lg hover:bg-surface-page transition-colors font-medium flex items-center justify-center gap-3"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g fill="none" fillRule="evenodd">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </g>
            </svg>
            {t('googleSignIn')}
          </button>
        </>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg text-accent-danger text-sm">
          {t('error')}
        </div>
      )}
    </div>
  );
}
