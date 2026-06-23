'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/components/AuthProvider';
import {Link} from '@/i18n/navigation';
import {setToken} from '@/lib/api';
import {verifyMagicLink} from '@/lib/auth';

type Status = 'verifying' | 'success' | 'error_invalid' | 'error_generic';

export default function VerifyPage() {
  const t = useTranslations('Auth.verify');
  const locale = useLocale();
  const router = useRouter();
  const {refresh} = useAuth();

  const [status, setStatus] = useState<Status>('verifying');

  useEffect(() => {
    async function run() {
      const fragmentParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragmentParams.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        await refresh();
        setStatus('success');
        window.setTimeout(() => router.push(`/${locale}`), 800);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const magicToken = searchParams.get('token');
      if (magicToken) {
        try {
          await verifyMagicLink(magicToken);
          await refresh();
          setStatus('success');
          window.setTimeout(() => router.push(`/${locale}`), 800);
        } catch {
          setStatus('error_invalid');
        }
        return;
      }

      if (searchParams.get('error')) {
        setStatus('error_generic');
        return;
      }

      setStatus('error_generic');
    }

    void run();
  }, [locale, refresh, router]);

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {status === 'verifying' && <p className="text-text-secondary">{t('verifying')}</p>}
      {status === 'success' && (
        <p className="text-accent-verified font-medium">{t('success')}</p>
      )}
      {(status === 'error_invalid' || status === 'error_generic') && (
        <div className="space-y-4">
          <p className="text-accent-danger">
            {status === 'error_invalid' ? t('errorInvalid') : t('errorGeneric')}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors"
          >
            {t('backToLogin')}
          </Link>
        </div>
      )}
    </div>
  );
}
