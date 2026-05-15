import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import VerificationBadge from '@/components/VerificationBadge';
import {Link} from '@/i18n/navigation';
import {getAllProperties, getPropertyBySlug} from '@/lib/properties';

type Props = {
  params: Promise<{locale: 'ar' | 'de' | 'en'; slug: string}>;
};

export default async function PropertyPage({params}: Props) {
  const {slug} = await params;
  const locale = (await getLocale()) as 'ar' | 'de' | 'en';
  const property = getPropertyBySlug(slug);
  const t = await getTranslations('Properties');

  if (!property) {
    notFound();
  }

  const priceFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar' : locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/properties" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← {t('details.backToList')}
      </Link>

      {/* Hero image */}
      <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden mb-6">
        <Image
          src={property.imageUrl}
          alt={property.title[locale]}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1024px"
          priority
          unoptimized
        />
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <VerificationBadge status={property.verification} />
          <span className="text-sm text-gray-600">{t(`types.${property.type}`)}</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-600">{t(`status.${property.status}`)}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
          {property.title[locale]}
        </h1>
        <p className="text-gray-600">
          {property.neighborhood}, {property.city}
        </p>
      </header>

      {/* Price + key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('details.price')}</p>
          <p className="text-xl font-bold">{priceFormatter.format(property.priceUsd)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{t('details.area')}</p>
          <p className="text-xl font-bold">{property.areaSqm} m²</p>
        </div>
        {property.bedrooms !== undefined && (
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('details.bedrooms')}</p>
            <p className="text-xl font-bold">{property.bedrooms}</p>
          </div>
        )}
        {property.bathrooms !== undefined && (
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('details.bathrooms')}</p>
            <p className="text-xl font-bold">{property.bathrooms}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('details.description')}</h2>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {property.description[locale]}
        </p>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-gray-200 pt-6">
        <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          {t('contactOwner')}
        </button>
        <p className="text-xs text-gray-500 mt-4">{t('contactDisclaimer')}</p>
      </section>
    </article>
  );
}

export function generateStaticParams() {
  return getAllProperties().map((p) => ({slug: p.slug}));
}
