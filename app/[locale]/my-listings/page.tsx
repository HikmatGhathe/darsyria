'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {listMyProperties, type MyListingItem} from '@/lib/properties';
import {formatPrice} from '@/lib/property-display';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-accent-verified/10 text-accent-verified',
  draft: 'bg-surface-page text-text-secondary',
  sold: 'bg-brand-navy/10 text-brand-navy',
  rejected: 'bg-accent-danger-bg text-accent-danger',
  removed: 'bg-accent-danger-bg text-accent-danger'
};

export default function MyListingsPage() {
  const t = useTranslations('MyListings');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading} = useAuth();

  const [items, setItems] = useState<MyListingItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/${locale}/login?next=/my-listings`);
  }, [isLoading, user, locale, router]);

  useEffect(() => {
    if (!user) return;
    listMyProperties()
      .then(setItems)
      .catch(() => setError(true));
  }, [user]);

  if (isLoading || (!items && !error && user)) {
    return <main className="max-w-4xl mx-auto px-6 py-10 text-sm text-text-secondary">{t('loading')}</main>;
  }
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <Link
          href="/properties/new"
          className="px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover whitespace-nowrap"
        >
          + {t('newListing')}
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{t('loadError')}</p>
        </div>
      ) : items && items.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface-card border border-border-subtle rounded-xl">
          <p className="text-text-secondary mb-4">{t('empty')}</p>
          <Link
            href="/properties/new"
            className="inline-block px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover font-medium"
          >
            {t('newListing')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items?.map((it) => (
            <li
              key={it.id}
              className="bg-surface-card border border-border-subtle rounded-xl p-3 flex items-center gap-4"
            >
              <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-page">
                {it.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.cover_image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary truncate">{it.title}</p>
                <p className="text-xs text-text-tertiary truncate">
                  {it.city} · {formatPrice(it.price_amount, locale)}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[it.status] ?? 'bg-surface-page text-text-secondary'
                    }`}
                  >
                    {t(`status_${it.status}`)}
                  </span>
                  {it.verification_status === 'verified' && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-verified/10 text-accent-verified">
                      {t('ownershipVerified')}
                    </span>
                  )}
                  {it.invoice_status && (
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        it.invoice_status === 'paid'
                          ? 'bg-accent-verified/10 text-accent-verified'
                          : 'bg-accent-warning-bg text-accent-warning'
                      }`}
                    >
                      {t('invoice')}: {t(`invoice_${it.invoice_status}`)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/properties/${it.id}`}
                  className="px-3 py-1.5 text-sm border border-border-subtle rounded-lg hover:bg-surface-page"
                >
                  {t('view')}
                </Link>
                <Link
                  href={`/properties/${it.id}/edit`}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-navy-hover"
                >
                  {t('edit')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
