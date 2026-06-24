import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import {getPropertyServer} from '@/lib/server-api';
import PropertyDetailView from '@/components/PropertyDetailView';
import DraftListingFallback from '@/components/DraftListingFallback';
import {formatPrice} from '@/lib/property-display';
import {SITE_URL} from '@/lib/site';

type Params = Promise<{locale: string; slug: string}>;

function metaDescription(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 155);
}

function localeAlternates(id: string): Record<string, string> {
  return {
    en: `${SITE_URL}/en/properties/${id}`,
    de: `${SITE_URL}/de/properties/${id}`,
    ar: `${SITE_URL}/ar/properties/${id}`
  };
}

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale, slug} = await params;
  const property = await getPropertyServer(slug);

  if (!property) {
    const t = await getTranslations({locale, namespace: 'PropertyDisplay'});
    return {title: t('notFoundTitle'), robots: {index: false}};
  }

  const title = `${property.title} — ${formatPrice(property.price_amount, locale)}`;
  const description = metaDescription(property.description);
  const cover = property.images?.[0]?.public_url;
  const url = `${SITE_URL}/${locale}/properties/${property.id}`;

  return {
    title,
    description,
    alternates: {canonical: url, languages: localeAlternates(property.id)},
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: cover ? [cover] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cover ? [cover] : undefined
    }
  };
}

export default async function PropertyDetailPage({params}: {params: Params}) {
  const {locale, slug} = await params;
  const property = await getPropertyServer(slug);

  if (!property) {
    // Anonymous request (incl. crawlers) for a missing/non-active listing →
    // real 404. A request carrying a session may be an owner viewing their own
    // draft → hand off to the authed client fallback.
    const cookieStore = await cookies();
    if (!cookieStore.has('darsyria_access_token')) {
      notFound();
    }
    return <DraftListingFallback id={slug} />;
  }

  const cover = property.images?.[0]?.public_url;
  const url = `${SITE_URL}/${locale}/properties/${property.id}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: property.title,
      description: metaDescription(property.description),
      ...(cover ? {image: [cover]} : {}),
      category: property.property_type,
      offers: {
        '@type': 'Offer',
        price: Number(property.price_amount),
        priceCurrency: property.price_currency,
        availability:
          property.status === 'active'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Properties', item: `${SITE_URL}/${locale}/properties`},
        {'@type': 'ListItem', position: 2, name: property.title, item: url}
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <PropertyDetailView property={property} />
    </>
  );
}
