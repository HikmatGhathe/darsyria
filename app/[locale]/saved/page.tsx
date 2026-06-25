'use client';

import {useEffect, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {useFavorites} from '@/components/FavoritesProvider';
import PropertyCard from '@/components/PropertyCard';
import {listFavorites} from '@/lib/favorites';
import {
  listSavedSearches,
  deleteSavedSearch,
  savedSearchHref,
  type SavedSearch
} from '@/lib/saved-searches';
import type {ApiPropertyListItem} from '@/lib/properties';

export default function SavedPage() {
  const t = useTranslations('Saved');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading: authLoading} = useAuth();
  const {isFavorited} = useFavorites();

  const [items, setItems] = useState<ApiPropertyListItem[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    setLoading(true);
    Promise.all([listFavorites(), listSavedSearches()])
      .then(([favs, ss]) => {
        if (!cancelled) {
          setItems(favs);
          setSearches(ss);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDeleteSearch(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id)); // optimistic
    try {
      await deleteSavedSearch(id);
    } catch (e) {
      console.error('Delete saved search failed:', e);
    }
  }

  if (authLoading || !user) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-text-secondary">{t('loading')}</div>;
  }

  const visible = items.filter((p) => isFavorited(p.id));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary mb-2">{t('title')}</h1>
        <p className="text-text-secondary">{t('subtitle')}</p>
      </header>

      {loading ? (
        <div className="text-text-secondary py-12 text-center">{t('loading')}</div>
      ) : (
        <div className="space-y-12">
          {/* Saved searches */}
          {searches.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-4">{t('searchesTitle')}</h2>
              <ul className="space-y-2">
                {searches.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 p-4 bg-surface-card border border-border-subtle rounded-xl"
                  >
                    <Link
                      href={savedSearchHref(locale, s)}
                      className="text-sm font-medium text-text-primary hover:text-brand-navy truncate"
                    >
                      {s.label}
                    </Link>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={savedSearchHref(locale, s)}
                        className="text-sm text-brand-navy hover:underline"
                      >
                        {t('runSearch')}
                      </Link>
                      <button
                        onClick={() => handleDeleteSearch(s.id)}
                        aria-label={t('deleteSearch')}
                        title={t('deleteSearch')}
                        className="text-text-tertiary hover:text-accent-danger transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Saved listings */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">{t('listingsTitle')}</h2>
            {visible.length === 0 ? (
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
          </section>
        </div>
      )}
    </div>
  );
}
