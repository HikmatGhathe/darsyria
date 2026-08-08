'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {useAuth} from '@/components/AuthProvider';
import {updateMe} from '@/lib/auth';
import {createProperty, type PropertyCreateInput} from '@/lib/properties';
import PropertyMap from '@/components/PropertyMap';
import {GOVERNORATE_KEYS, governorateCenter} from '@/lib/governorates';

type FormState = {
  title: string;
  description: string;
  governorate: string;
  city: string;
  neighborhood: string;
  lat: number | null;
  lng: number | null;
  property_type: PropertyCreateInput['property_type'];
  rooms: string;
  bathrooms: string;
  area_sqm: string;
  price_amount: string;
  price_currency: PropertyCreateInput['price_currency'];
  document_status: PropertyCreateInput['document_status'];
};

type SellerSetupState = {
  account_type: '' | 'individual' | 'company';
  company_name: string;
  company_address: string;
  phone: string;
};

const initialState: FormState = {
  title: '',
  description: '',
  governorate: '',
  city: '',
  neighborhood: '',
  lat: null,
  lng: null,
  property_type: 'apartment',
  rooms: '',
  bathrooms: '',
  area_sqm: '',
  price_amount: '',
  price_currency: 'USD',
  document_status: 'none'
};

const initialSellerSetup: SellerSetupState = {
  account_type: '',
  company_name: '',
  company_address: '',
  phone: ''
};

export default function NewPropertyPage() {
  const t = useTranslations('PropertyForm');
  const tAccount = useTranslations('Account');
  const tGov = useTranslations('Governorates');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading: authLoading, refresh} = useAuth();

  const [form, setForm] = useState<FormState>(initialState);
  const [sellerSetup, setSellerSetup] = useState<SellerSetupState>(initialSellerSetup);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerSetupError, setSellerSetupError] = useState<string | null>(null);

  if (authLoading) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-text-secondary">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-text-secondary mb-4">{t('errorAuth')}</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors"
        >
          Sign in
        </button>
      </div>
    );
  }

  const needsSellerSetup = user.account_type == null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function updateSellerSetup<K extends keyof SellerSetupState>(key: K, value: SellerSetupState[K]) {
    setSellerSetup((prev) => ({...prev, [key]: value}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setSellerSetupError(null);

    if (needsSellerSetup) {
      if (!sellerSetup.account_type) {
        setSellerSetupError(t('sellerSetupRequired'));
        return;
      }
      if (
        sellerSetup.account_type === 'company' &&
        (!sellerSetup.company_name.trim() || !sellerSetup.company_address.trim() || !sellerSetup.phone.trim())
      ) {
        setSellerSetupError(tAccount('companyFieldsRequired'));
        return;
      }
    }

    setIsSubmitting(true);

    if (needsSellerSetup) {
      try {
        if (sellerSetup.account_type === 'company') {
          await updateMe({
            account_type: 'company',
            company_name: sellerSetup.company_name.trim(),
            company_address: sellerSetup.company_address.trim(),
            phone: sellerSetup.phone.trim()
          });
        } else {
          await updateMe({account_type: 'individual'});
        }
        await refresh();
      } catch (err) {
        console.error('Seller setup failed:', err);
        setSellerSetupError(t('sellerSetupError'));
        setIsSubmitting(false);
        return;
      }
    }

    const payload: PropertyCreateInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      governorate: form.governorate,
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || undefined,
      latitude: form.lat ?? undefined,
      longitude: form.lng ?? undefined,
      property_type: form.property_type,
      price_amount: parseFloat(form.price_amount),
      price_currency: form.price_currency,
      document_status: form.document_status,
      rooms: form.rooms ? parseInt(form.rooms, 10) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
      area_sqm: form.area_sqm ? parseInt(form.area_sqm, 10) : undefined
    };

    try {
      const created = await createProperty(payload);
      router.push(`/${locale}/properties/${created.id}`);
    } catch (err) {
      console.error('Create property failed:', err);
      setError(t('errorGeneric'));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 text-text-primary">{t('title')}</h1>
        <p className="text-text-secondary">{t('subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Seller setup — only shown the first time, before account_type is set */}
        {needsSellerSetup && (
          <section className="p-5 bg-surface-card border border-brand-navy/30 rounded-xl">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              {t('sellerSetupHeading')}
            </h2>
            <p className="text-sm text-text-secondary mb-4">{t('sellerSetupBody')}</p>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="seller_account_type"
                  value="individual"
                  checked={sellerSetup.account_type === 'individual'}
                  onChange={() => updateSellerSetup('account_type', 'individual')}
                  className="text-brand-navy focus:ring-brand-navy"
                />
                <span className="text-sm text-text-primary">{tAccount('accountTypeIndividual')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="seller_account_type"
                  value="company"
                  checked={sellerSetup.account_type === 'company'}
                  onChange={() => updateSellerSetup('account_type', 'company')}
                  className="text-brand-navy focus:ring-brand-navy"
                />
                <span className="text-sm text-text-primary">{tAccount('accountTypeCompany')}</span>
              </label>
            </div>

            {sellerSetup.account_type === 'company' && (
              <div className="space-y-4 p-4 bg-surface-page rounded-lg">
                <p className="text-xs text-text-tertiary">{tAccount('companyFieldsNote')}</p>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {tAccount('companyName')} *
                  </label>
                  <input
                    type="text"
                    value={sellerSetup.company_name}
                    onChange={(e) => updateSellerSetup('company_name', e.target.value)}
                    placeholder={tAccount('companyNamePlaceholder')}
                    className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {tAccount('companyAddress')} *
                  </label>
                  <textarea
                    value={sellerSetup.company_address}
                    onChange={(e) => updateSellerSetup('company_address', e.target.value)}
                    placeholder={tAccount('companyAddressPlaceholder')}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {tAccount('phone')} *
                  </label>
                  <input
                    type="tel"
                    value={sellerSetup.phone}
                    onChange={(e) => updateSellerSetup('phone', e.target.value)}
                    placeholder={tAccount('phonePlaceholder')}
                    dir="ltr"
                    className="w-full px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                  />
                </div>
              </div>
            )}

            {sellerSetupError && (
              <p className="mt-4 text-sm text-accent-danger bg-accent-danger-bg border border-accent-danger/30 rounded-lg px-3 py-2">
                {sellerSetupError}
              </p>
            )}
          </section>
        )}

        {/* Section: Basics */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {t('sectionBasics')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelTitle')} *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('placeholderTitle')}
                required
                minLength={5}
                maxLength={200}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelDescription')} *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder={t('placeholderDescription')}
                required
                minLength={20}
                maxLength={10000}
                rows={6}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary resize-y"
              />
            </div>
          </div>
        </section>

        {/* Section: Location */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {t('sectionLocation')}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('labelGovernorate')} *
            </label>
            <select
              value={form.governorate}
              onChange={(e) => update('governorate', e.target.value)}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
            >
              <option value="" disabled>{t('governoratePlaceholder')}</option>
              {GOVERNORATE_KEYS.map((g) => (
                <option key={g} value={g}>{tGov(g)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelCity')} *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={t('placeholderCity')}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelNeighborhood')}
              </label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => update('neighborhood', e.target.value)}
                placeholder={t('placeholderNeighborhood')}
                maxLength={150}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
          </div>
          {/* Optional map pin */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary">{t('mapLabel')}</label>
              {form.lat != null && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({...prev, lat: null, lng: null}))}
                  className="text-xs text-text-tertiary hover:text-accent-danger underline"
                >
                  {t('clearPin')}
                </button>
              )}
            </div>
            <PropertyMap
              interactive
              lat={form.lat}
              lng={form.lng}
              centroid={governorateCenter(form.governorate || null)}
              onPick={(lat, lng) => setForm((prev) => ({...prev, lat, lng}))}
            />
            <p className="text-xs text-text-tertiary mt-1">{t('mapHint')}</p>
          </div>
        </section>

        {/* Section: Attributes */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {t('sectionAttributes')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelPropertyType')} *
              </label>
              <select
                value={form.property_type}
                onChange={(e) => update('property_type', e.target.value as FormState['property_type'])}
                required
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              >
                <option value="apartment">{t('typeApartment')}</option>
                <option value="house">{t('typeHouse')}</option>
                <option value="land">{t('typeLand')}</option>
                <option value="commercial">{t('typeCommercial')}</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('labelRooms')}
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
                  {t('labelBathrooms')}
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
                  {t('labelArea')}
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

        {/* Section: Price */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {t('sectionPrice')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelPriceAmount')} *
              </label>
              <input
                type="number"
                value={form.price_amount}
                onChange={(e) => update('price_amount', e.target.value)}
                placeholder={t('placeholderPriceAmount')}
                required
                min={1}
                step="0.01"
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('labelPriceCurrency')} *
              </label>
              <select
                value={form.price_currency}
                onChange={(e) => update('price_currency', e.target.value as FormState['price_currency'])}
                required
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy bg-surface-card text-text-primary"
              >
                <option value="USD">{t('currencyUSD')}</option>
                <option value="EUR">{t('currencyEUR')}</option>
                <option value="SYP">{t('currencySYP')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section: Documents */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-border-subtle">
            {t('sectionDocuments')}
          </h2>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('labelDocumentStatus')} *
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
                    {value === 'none' && t('docNone')}
                    {value === 'claimed' && t('docClaimed')}
                    {value === 'documents_provided' && t('docProvided')}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-tertiary mt-3 italic">{t('docNote')}</p>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
            <p className="text-sm text-accent-danger">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border-subtle">
          <p className="text-sm text-text-tertiary flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            {t('submitHint')}
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
