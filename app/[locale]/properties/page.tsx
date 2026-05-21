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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600 max-w-2xl">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/properties/new`}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
        >
          + {t('createListingCTA')}
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Filter sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <form
            onSubmit={applyFilters}
            className="p-5 bg-gray-50 border border-gray-200 rounded-lg space-y-4"
          >
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              {t('filtersHeading')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelCity')}
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={t('placeholderCity')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelType')}
              </label>
              <select
                value={filters.property_type}
                onChange={(e) => update('property_type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('labelMinPrice')}
                </label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => update('min_price', e.target.value)}
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('labelMaxPrice')}
                </label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => update('max_price', e.target.value)}
                  min={0}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelRooms')}
              </label>
              <select
                value={filters.rooms}
                onChange={(e) => update('rooms', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
              >
                {t('applyFilters')}
              </button>
              {hasFiltersApplied && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
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
            <div className="text-gray-500 py-12 text-center">Loading...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700 mb-4">
                {hasFiltersApplied ? t('noResults') : t('emptyState')}
              </p>
              {!hasFiltersApplied && (
                <Link
                  href={`/${locale}/properties/new`}
                  className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {t('createListingCTA')}
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
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
  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <Link
      href={`/${locale}/properties/${property.id}`}
      className="block p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
          {property.title}
        </h3>
        <span
          className={`shrink-0 inline-block px-2 py-0.5 text-xs font-medium border rounded-full ${badgeColors[docInfo.color]}`}
        >
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {formatLocation(property.city, property.neighborhood, locale)}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(property.price_amount, property.price_currency, locale)}
        </span>
        <span className="text-xs text-gray-500">
          {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
          {property.rooms != null && ` · ${t('rooms', {count: property.rooms})}`}
          {property.area_sqm != null && ` · ${t('areaSqm', {value: property.area_sqm})}`}
        </span>
      </div>
    </Link>
  );
}
