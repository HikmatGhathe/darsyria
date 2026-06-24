'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {propertyTypeKey} from '@/lib/property-display';

const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;

export type FilterValues = {
  city: string;
  seller: string;
  property_type: string;
  min_price: string;
  max_price: string;
  rooms: string;
};

// Client filter sidebar for the (server-rendered) browse page. Applying
// filters pushes them to the URL query string, so the server re-renders the
// matching listings and the filtered view is shareable/bookmarkable.
export default function PropertyFilters({initial}: {initial: FilterValues}) {
  const t = useTranslations('PropertyBrowse');
  const tDisplay = useTranslations('PropertyDisplay');
  const router = useRouter();

  const [filters, setFilters] = useState<FilterValues>(initial);

  function update<K extends keyof FilterValues>(key: K, value: FilterValues[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  function apply(e: {preventDefault(): void}) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (filters.seller.trim()) params.set('seller', filters.seller.trim());
    if (filters.property_type) params.set('property_type', filters.property_type);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.rooms) params.set('rooms', filters.rooms);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : '/properties');
  }

  function clear() {
    setFilters({city: '', seller: '', property_type: '', min_price: '', max_price: '', rooms: ''});
    router.push('/properties');
  }

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <form
      onSubmit={apply}
      className="p-5 bg-surface-card border border-border-subtle rounded-xl space-y-4"
    >
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
        {t('filtersHeading')}
      </h2>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelCity')}</label>
        <input
          type="text"
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
          placeholder={t('placeholderCity')}
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelSeller')}</label>
        <input
          type="text"
          value={filters.seller}
          onChange={(e) => update('seller', e.target.value)}
          placeholder={t('placeholderSeller')}
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelType')}</label>
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
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelMinPrice')}</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => update('min_price', e.target.value)}
            min={0}
            className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelMaxPrice')}</label>
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
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelRooms')}</label>
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
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
    </form>
  );
}
