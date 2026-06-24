'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

const STORAGE_KEY = 'darsyria-cookie-notice-dismissed';

export default function CookieNotice() {
  const t = useTranslations('CookieNotice');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — just don't show the banner
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // best-effort persistence only
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-card px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {t('message')}{' '}
          <Link href="/privacy" className="text-brand-navy hover:underline">
            {t('privacyLink')}
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="rounded-lg bg-brand-navy px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
