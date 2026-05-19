'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {useAuth} from '@/components/AuthProvider';
import {createProperty, type PropertyCreateInput} from '@/lib/properties';

type FormState = {
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  property_type: PropertyCreateInput['property_type'];
  rooms: string;
  bathrooms: string;
  area_sqm: string;
  price_amount: string;
  price_currency: PropertyCreateInput['price_currency'];
  document_status: PropertyCreateInput['document_status'];
};

const initialState: FormState = {
  title: '',
  description: '',
  city: '',
  neighborhood: '',
  property_type: 'apartment',
  rooms: '',
  bathrooms: '',
  area_sqm: '',
  price_amount: '',
  price_currency: 'USD',
  document_status: 'none'
};

export default function NewPropertyPage() {
  const t = useTranslations('PropertyForm');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading: authLoading} = useAuth();

  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-gray-500">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-gray-700 mb-4">{t('errorAuth')}</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign in
        </button>
      </div>
    );
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    const payload: PropertyCreateInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || undefined,
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
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Basics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {t('sectionBasics')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </div>
        </section>

        {/* Section: Location */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {t('sectionLocation')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelNeighborhood')}
              </label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => update('neighborhood', e.target.value)}
                placeholder={t('placeholderNeighborhood')}
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Section: Attributes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {t('sectionAttributes')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelPropertyType')} *
              </label>
              <select
                value={form.property_type}
                onChange={(e) => update('property_type', e.target.value as FormState['property_type'])}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="apartment">{t('typeApartment')}</option>
                <option value="house">{t('typeHouse')}</option>
                <option value="land">{t('typeLand')}</option>
                <option value="commercial">{t('typeCommercial')}</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('labelRooms')}
                </label>
                <input
                  type="number"
                  value={form.rooms}
                  onChange={(e) => update('rooms', e.target.value)}
                  min={0}
                  max={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('labelBathrooms')}
                </label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => update('bathrooms', e.target.value)}
                  min={0}
                  max={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('labelArea')}
                </label>
                <input
                  type="number"
                  value={form.area_sqm}
                  onChange={(e) => update('area_sqm', e.target.value)}
                  min={1}
                  max={100000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Price */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {t('sectionPrice')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('labelPriceCurrency')} *
              </label>
              <select
                value={form.price_currency}
                onChange={(e) => update('price_currency', e.target.value as FormState['price_currency'])}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {t('sectionDocuments')}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    {value === 'none' && t('docNone')}
                    {value === 'claimed' && t('docClaimed')}
                    {value === 'documents_provided' && t('docProvided')}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">{t('docNote')}</p>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
