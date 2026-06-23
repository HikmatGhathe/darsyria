'use client';

import {useState, useEffect, useCallback} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {listProperties, type PropertyListItem, type PropertyFilters} from '@/lib/properties';
import {
  formatPrice,
  propertyTypeKey,
  documentStatusInfo,
  formatLocation
} from '@/lib/property-display';

const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;

type FilterState = {
  city: string;
  property_type: string;
  min_price: string;
  max_price: string;
  rooms: string;
};

const initialFilters: FilterState = {
  city: '',
  property_type: '',
  min_price: '',
  max_price: '',
  rooms: ''
};

export default function PropertiesBrowsePage() {
  const t = useTranslations('PropertyBrowse');
  const tDisplay = useTranslations('PropertyDisplay');
  const locale = useLocale();

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildApiFilters = useCallback((f: FilterState): PropertyFilters => {
    const out: PropertyFilters = {};
    if (f.city.trim()) out.city = f.city.trim();
    if (f.property_type) out.property_type = f.property_type;
    if (f.min_price) {
      const n = parseFloat(f.min_price);
      if (!isNaN(n) && n >= 0) out.min_price = n;
    }
    if (f.max_price) {
      const n = parseFloat(f.max_price);
      if (!isNaN(n) && n >= 0) out.max_price = n;
    }
    if (f.rooms) {
      const n = parseInt(f.rooms, 10);
      if (!isNaN(n) && n >= 0) out.rooms = n;
    }
    return out;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listProperties(buildApiFilters(appliedFilters));
        if (!cancelled) setProperties(data);
      } catch (e) {
        if (!cancelled) {
          console.error('List properties failed:', e);
          setError(t('errorLoading'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, buildApiFilters, t]);

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  function applyFilters(e: {preventDefault(): void}) {
    e.preventDefault();
    setAppliedFilters(filters);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }

  const hasFiltersApplied = Object.values(appliedFilters).some((v) => v !== '');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary mb-2">{t('title')}</h1>
          <p className="text-text-secondary max-w-2xl">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/properties/new`}
          className="px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium whitespace-nowrap"
        >
          + {t('createListingCTA')}
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Filter sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <form
            onSubmit={applyFilters}
            className="p-5 bg-surface-card border border-border-subtle rounded-xl space-y-4"
          >
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              {t('filtersHeading')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelCity')}
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={t('placeholderCity')}
                className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelType')}
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => update('property_type', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
              >
                <option value="">{t('anyType')}</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tDisplay(propertyTypeKey(type) as Parameters<typeof tDisplay>[0])}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('labelMinPrice')}
                </label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => update('min_price', e.target.value)}
                  min={0}
                  className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('labelMaxPrice')}
                </label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => update('max_price', e.target.value)}
                  min={0}
                  className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelRooms')}
              </label>
              <select
                value={filters.rooms}
                onChange={(e) => update('rooms', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
              >
                <option value="">{t('anyRooms')}</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover transition-colors"
              >
                {t('applyFilters')}
              </button>
              {hasFiltersApplied && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* Results */}
        <main>
          {isLoading ? (
            <div className="text-text-secondary py-12 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg text-accent-danger">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 px-6 bg-surface-card border border-border-subtle rounded-xl">
              <p className="text-text-secondary mb-4">
                {hasFiltersApplied ? t('noResults') : t('emptyState')}
              </p>
              {!hasFiltersApplied && (
                <Link
                  href={`/${locale}/properties/new`}
                  className="inline-block px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium"
                >
                  {t('createListingCTA')}
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-text-tertiary mb-4">
                {t('resultCount', {count: properties.length})}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} locale={locale} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function PropertyCard({
  property,
  locale
}: {
  property: PropertyListItem;
  locale: string;
}) {
  const t = useTranslations('PropertyDisplay');
  const tVerify = useTranslations('Properties.verification');
  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-surface-card text-brand-navy border-brand-navy/30',
    amber: 'bg-accent-warning-bg text-accent-warning border-accent-warning/30',
    gray: 'bg-surface-card text-text-secondary border-border-subtle'
  };

  return (
    <Link
      href={`/${locale}/properties/${property.id}`}
      className="block bg-surface-card border border-border-subtle rounded-xl hover:border-border-strong hover:-translate-y-0.5 transition overflow-hidden"
    >
      {/* Cover image or placeholder */}
      <div className="relative aspect-[4/3] bg-surface-page overflow-hidden">
        {property.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.cover_image_url}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
        )}

        {/* Verified badge — browse endpoint only ever returns active (admin-approved) listings */}
        <span className="absolute top-2 start-2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {tVerify('verified')}
        </span>

        <span
          className={`absolute top-2 end-2 inline-block px-2 py-0.5 text-xs font-medium border rounded-full backdrop-blur-sm bg-opacity-90 ${badgeColors[docInfo.color]}`}
        >
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 mb-2">
          {property.title}
        </h3>
        <p className="text-sm text-text-secondary mb-3 flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {formatLocation(property.city, property.neighborhood, locale)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-text-primary">
            {formatPrice(property.price_amount, locale)}
          </span>
          <span className="text-xs text-text-tertiary">
            {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
            {property.rooms != null && ` · ${t('rooms', {count: property.rooms})}`}
            {property.area_sqm != null && ` · ${t('areaSqm', {value: property.area_sqm})}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
