'use client';

import {useEffect, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {useFavorites} from '@/components/FavoritesProvider';
import PropertyCard from '@/components/PropertyCard';
import {listFavorites} from '@/lib/favorites';
import type {ApiPropertyListItem} from '@/lib/properties';

export default function SavedPage() {
  const t = useTranslations('Saved');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading: authLoading} = useAuth();
  const {isFavorited} = useFavorites();

  const [items, setItems] = useState<ApiPropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    setLoading(true);
    listFavorites()
      .then((d) => {
        if (!cancelled) setItems(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || !user) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-text-secondary">{t('loading')}</div>;
  }

  // Drop any the user un-saves while on the page (the heart toggles live).
  const visible = items.filter((p) => isFavorited(p.id));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">{t('title')}</h1>
        <p className="text-text-secondary">{t('subtitle')}</p>
      </header>

      {loading ? (
        <div className="text-text-secondary py-12 text-center">{t('loading')}</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 px-6 bg-surface-card border border-border-subtle rounded-xl">
          <p className="text-text-secondary mb-4">{t('empty')}</p>
          <Link
            href={`/${locale}/properties`}
            className="inline-block px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium"
          >
            {t('browseCta')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <PropertyCard key={p.id} property={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
