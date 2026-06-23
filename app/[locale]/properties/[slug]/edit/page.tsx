'use client';

import {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useAuth} from '@/components/AuthProvider';
import {
  getProperty,
  updateProperty,
  type Property,
  type PropertyUpdateInput
} from '@/lib/properties';

type FormState = {
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  property_type: 'apartment' | 'house' | 'land' | 'commercial';
  rooms: string;
  bathrooms: string;
  area_sqm: string;
  price_amount: string;
  price_currency: 'USD' | 'EUR' | 'SYP';
  document_status: 'none' | 'claimed' | 'documents_provided';
};

function propertyToForm(p: Property): FormState {
  return {
    title: p.title,
    description: p.description,
    city: p.city,
    neighborhood: p.neighborhood ?? '',
    property_type: p.property_type as FormState['property_type'],
    rooms: p.rooms != null ? String(p.rooms) : '',
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
    area_sqm: p.area_sqm != null ? String(p.area_sqm) : '',
    price_amount: String(p.price_amount),
    price_currency: p.price_currency as FormState['price_currency'],
    document_status: p.document_status as FormState['document_status']
  };
}

function buildUpdatePayload(form: FormState, original: Property): PropertyUpdateInput {
  const out: PropertyUpdateInput = {};
  const origNeighborhood = original.neighborhood ?? '';
  const origRooms = original.rooms != null ? String(original.rooms) : '';
  const origBathrooms = original.bathrooms != null ? String(original.bathrooms) : '';
  const origArea = original.area_sqm != null ? String(original.area_sqm) : '';

  if (form.title.trim() !== original.title) out.title = form.title.trim();
  if (form.description.trim() !== original.description) out.description = form.description.trim();
  if (form.city.trim() !== original.city) out.city = form.city.trim();
  if (form.neighborhood.trim() !== origNeighborhood) {
    out.neighborhood = form.neighborhood.trim() || undefined;
  }
  if (form.property_type !== original.property_type) out.property_type = form.property_type;
  if (form.price_currency !== original.price_currency) out.price_currency = form.price_currency;
  if (form.document_status !== original.document_status) out.document_status = form.document_status;
  if (form.price_amount !== String(original.price_amount)) {
    const n = parseFloat(form.price_amount);
    if (!isNaN(n)) out.price_amount = n;
  }
  if (form.rooms !== origRooms) {
    out.rooms = form.rooms ? parseInt(form.rooms, 10) : undefined;
  }
  if (form.bathrooms !== origBathrooms) {
    out.bathrooms = form.bathrooms ? parseInt(form.bathrooms, 10) : undefined;
  }
  if (form.area_sqm !== origArea) {
    out.area_sqm = form.area_sqm ? parseInt(form.area_sqm, 10) : undefined;
  }
  return out;
}

export default function EditPropertyPage() {
  const t = useTranslations('EditProperty');
  const tForm = useTranslations('PropertyForm');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.slug as string;
  const {user, isLoading: authLoading} = useAuth();

  const [original, setOriginal] = useState<Property | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notOwner, setNotOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const p = await getProperty(id);
        if (cancelled) return;
        setOriginal(p);
        setForm(propertyToForm(p));
      } catch (e) {
        if (!cancelled) {
          console.error('Load failed:', e);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!authLoading && !isLoading && original && user) {
      if (original.owner_id !== user.id) setNotOwner(true);
    }
  }, [authLoading, isLoading, original, user]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? {...prev, [key]: value} : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !original || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    const payload = buildUpdatePayload(form, original);

    if (Object.keys(payload).length === 0) {
      router.push(`/${locale}/properties/${id}`);
      return;
    }

    try {
      await updateProperty(id, payload);
      router.push(`/${locale}/properties/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
      setError(t('errorGeneric'));
      setIsSubmitting(false);
    }
  }

  if (authLoading || isLoading) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-text-secondary">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-text-secondary mb-4">Listing not found.</p>
        <Link href={`/${locale}/properties`} className="text-brand-navy hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-text-secondary mb-4">Please sign in to edit a listing.</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (notOwner) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-text-secondary mb-4">You can only edit your own listings.</p>
        <Link href={`/${locale}/properties/${id}`} className="text-brand-navy hover:underline">
          ← Back to listing
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <header className="mb-8">
        <Link
          href={`/${locale}/properties/${id}`}
          className="text-sm text-text-tertiary hover:text-text-primary mb-3 inline-block"
        >
          ← Back to listing
        </Link>
        <h1 className="text-3xl font-semibold mb-2 text-text-primary">{t('title')}</h1>
        <p className="text-text-secondary">{t('subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basics */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {tForm('sectionBasics')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelTitle')} *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                minLength={5}
                maxLength={200}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelDescription')} *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                required
                minLength={20}
                maxLength={10000}
                rows={6}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary resize-y"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {tForm('sectionLocation')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelCity')} *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelNeighborhood')}
              </label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => update('neighborhood', e.target.value)}
                maxLength={150}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {tForm('sectionAttributes')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelPropertyType')} *
              </label>
              <select
                value={form.property_type}
                onChange={(e) => update('property_type', e.target.value as FormState['property_type'])}
                required
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              >
                <option value="apartment">{tForm('typeApartment')}</option>
                <option value="house">{tForm('typeHouse')}</option>
                <option value="land">{tForm('typeLand')}</option>
                <option value="commercial">{tForm('typeCommercial')}</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {tForm('labelRooms')}
                </label>
                <input
                  type="number"
                  value={form.rooms}
                  onChange={(e) => update('rooms', e.target.value)}
                  min={0}
                  max={50}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {tForm('labelBathrooms')}
                </label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => update('bathrooms', e.target.value)}
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {tForm('labelArea')}
                </label>
                <input
                  type="number"
                  value={form.area_sqm}
                  onChange={(e) => update('area_sqm', e.target.value)}
                  min={1}
                  max={100000}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Price */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {tForm('sectionPrice')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelPriceAmount')} *
              </label>
              <input
                type="number"
                value={form.price_amount}
                onChange={(e) => update('price_amount', e.target.value)}
                required
                min={1}
                step="0.01"
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {tForm('labelPriceCurrency')} *
              </label>
              <select
                value={form.price_currency}
                onChange={(e) => update('price_currency', e.target.value as FormState['price_currency'])}
                required
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              >
                <option value="USD">{tForm('currencyUSD')}</option>
                <option value="EUR">{tForm('currencyEUR')}</option>
                <option value="SYP">{tForm('currencySYP')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {tForm('sectionDocuments')}
          </h2>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {tForm('labelDocumentStatus')} *
            </label>
            <div className="space-y-2">
              {(['none', 'claimed', 'documents_provided'] as const).map((value) => (
                <label key={value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="document_status"
                    value={value}
                    checked={form.document_status === value}
                    onChange={() => update('document_status', value)}
                    className="mt-1 text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="text-sm text-text-secondary">
                    {value === 'none' && tForm('docNone')}
                    {value === 'claimed' && tForm('docClaimed')}
                    {value === 'documents_provided' && tForm('docProvided')}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-tertiary mt-3 italic">{tForm('docNote')}</p>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
            <p className="text-sm text-accent-danger">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Link
            href={`/${locale}/properties/${id}`}
            className="px-6 py-3 bg-surface-card border border-border-subtle text-text-primary rounded-lg hover:bg-surface-page transition-colors font-medium"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
