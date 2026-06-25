'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import {createSavedSearch, type SavedSearchInput} from '@/lib/saved-searches';
import {propertyTypeKey} from '@/lib/property-display';

const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;
const SORTS = ['newest', 'oldest', 'price_asc', 'price_desc'] as const;

// The narrowing filters (everything except sort, which doesn't change the set).
type FormFilters = {
  city: string;
  seller: string;
  property_type: string;
  min_price: string;
  max_price: string;
  rooms: string;
};

export type FilterValues = FormFilters & {sort: string};

// Client filter sidebar for the (server-rendered) browse page. Applying
// filters pushes them to the URL query string, so the server re-renders the
// matching listings and the filtered view is shareable/bookmarkable. Sort is
// kept separate (it applies instantly, independent of the Apply button).
export default function PropertyFilters({initial}: {initial: FilterValues}) {
  const t = useTranslations('PropertyBrowse');
  const tDisplay = useTranslations('PropertyDisplay');
  const router = useRouter();
  const {user} = useAuth();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [filters, setFilters] = useState<FormFilters>({
    city: initial.city,
    seller: initial.seller,
    property_type: initial.property_type,
    min_price: initial.min_price,
    max_price: initial.max_price,
    rooms: initial.rooms
  });

  function update<K extends keyof FormFilters>(key: K, value: FormFilters[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  function buildHref(f: FormFilters, sort: string): string {
    const params = new URLSearchParams();
    if (f.city.trim()) params.set('city', f.city.trim());
    if (f.seller.trim()) params.set('seller', f.seller.trim());
    if (f.property_type) params.set('property_type', f.property_type);
    if (f.min_price) params.set('min_price', f.min_price);
    if (f.max_price) params.set('max_price', f.max_price);
    if (f.rooms) params.set('rooms', f.rooms);
    if (sort && sort !== 'newest') params.set('sort', sort);
    const qs = params.toString();
    return qs ? `/properties?${qs}` : '/properties';
  }

  function apply(e: {preventDefault(): void}) {
    e.preventDefault();
    router.push(buildHref(filters, initial.sort));
  }

  // Sort applies immediately, against the already-applied filters (not
  // unsaved edits in the form), and resets to page 1.
  function changeSort(sort: string) {
    router.push(buildHref(initial, sort));
  }

  function clear() {
    setFilters({city: '', seller: '', property_type: '', min_price: '', max_price: '', rooms: ''});
    router.push('/properties');
  }

  // Save the currently-applied filters (from the URL), not unsaved edits.
  async function saveSearch() {
    if (!user) {
      router.push('/login');
      return;
    }
    const input: SavedSearchInput = {};
    if (initial.city) input.city = initial.city;
    if (initial.seller) input.seller = initial.seller;
    if (initial.property_type) input.property_type = initial.property_type;
    const min = Number(initial.min_price);
    if (initial.min_price && !Number.isNaN(min)) input.min_price = min;
    const max = Number(initial.max_price);
    if (initial.max_price && !Number.isNaN(max)) input.max_price = max;
    const rooms = Number(initial.rooms);
    if (initial.rooms && !Number.isNaN(rooms)) input.rooms = rooms;

    setSaveState('saving');
    try {
      await createSavedSearch(input);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (e) {
      console.error('Save search failed:', e);
      setSaveState('idle');
    }
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

      <div className="pb-4 border-b border-border-subtle">
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('labelSort')}</label>
        <select
          value={SORTS.includes(initial.sort as (typeof SORTS)[number]) ? initial.sort : 'newest'}
          onChange={(e) => changeSort(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
        >
          <option value="newest">{t('sortNewest')}</option>
          <option value="oldest">{t('sortOldest')}</option>
          <option value="price_asc">{t('sortPriceAsc')}</option>
          <option value="price_desc">{t('sortPriceDesc')}</option>
        </select>
      </div>

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

      <button
        type="button"
        onClick={saveSearch}
        disabled={saveState === 'saving'}
        className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-page disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={saveState === 'saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {saveState === 'saved' ? t('searchSaved') : t('saveSearch')}
      </button>
    </form>
  );
}
