'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import VerificationBadge from '@/components/VerificationBadge';
import {Link} from '@/i18n/navigation';
import {getAllProperties} from '@/lib/properties';

export default function PropertiesPage() {
  const t = useTranslations('Properties');
  const locale = useLocale() as 'ar' | 'de' | 'en';
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const allProperties = getAllProperties();
  const properties = verifiedOnly
    ? allProperties.filter((p) => p.verification === 'verified')
    : allProperties;

  const priceFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar' : locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </header>

      {/* Filter bar */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setVerifiedOnly(false)}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            !verifiedOnly
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          {t('filters.all')}
        </button>
        <button
          onClick={() => setVerifiedOnly(true)}
          className={`px-4 py-2 text-sm rounded-lg border transition ${
            verifiedOnly
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          ✓ {t('filters.verified')}
        </button>
      </div>

      {properties.length === 0 ? (
        <p className="text-center py-12 text-gray-500">{t('noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.slug}`}
              className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={property.imageUrl}
                  alt={property.title[locale]}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <VerificationBadge status={property.verification} />
                  <span className="text-xs text-gray-500">{t(`types.${property.type}`)}</span>
                </div>
                <h2 className="text-base font-semibold mb-1 line-clamp-2">{property.title[locale]}</h2>
                <p className="text-sm text-gray-500 mb-3">
                  {property.neighborhood}, {property.city}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {priceFormatter.format(property.priceUsd)}
                  </span>
                  <span className="text-xs text-gray-500">{property.areaSqm} m²</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
