import type {Metadata} from 'next';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters, {type FilterValues} from '@/components/PropertyFilters';
import {listPropertiesServer} from '@/lib/server-api';
import type {PropertyFilters as ApiFilters} from '@/lib/properties';
import {SITE_URL} from '@/lib/site';

const PAGE_SIZE = 24;

type SearchParams = Promise<{[key: string]: string | string[] | undefined}>;
type Params = Promise<{locale: string}>;

function str(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'PropertyBrowse'});
  const base = `${SITE_URL}/${locale}/properties`;
  return {
    title: t('title'),
    description: t('subtitle'),
    // Canonicalize every filtered/paged variant to the base browse page to
    // avoid faceted duplicate-content.
    alternates: {
      canonical: base,
      languages: {
        en: `${SITE_URL}/en/properties`,
        de: `${SITE_URL}/de/properties`,
        ar: `${SITE_URL}/ar/properties`
      }
    }
  };
}

export default async function PropertiesBrowsePage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const {locale} = await params;
  const sp = await searchParams;
  const t = await getTranslations({locale, namespace: 'PropertyBrowse'});

  const values: FilterValues = {
    city: str(sp.city),
    seller: str(sp.seller),
    property_type: str(sp.property_type),
    min_price: str(sp.min_price),
    max_price: str(sp.max_price),
    rooms: str(sp.rooms)
  };
  const offset = Math.max(0, parseInt(str(sp.offset) || '0', 10) || 0);

  const apiFilters: ApiFilters = {limit: PAGE_SIZE, offset};
  if (values.city) apiFilters.city = values.city;
  if (values.seller) apiFilters.seller = values.seller;
  if (values.property_type) apiFilters.property_type = values.property_type;
  if (values.min_price && !isNaN(Number(values.min_price))) apiFilters.min_price = Number(values.min_price);
  if (values.max_price && !isNaN(Number(values.max_price))) apiFilters.max_price = Number(values.max_price);
  if (values.rooms && !isNaN(Number(values.rooms))) apiFilters.rooms = Number(values.rooms);

  const properties = await listPropertiesServer(apiFilters);

  const hasFilters = Object.values(values).some((v) => v !== '');

  // Preserve active filters when paging.
  function pageHref(newOffset: number): string {
    const params = new URLSearchParams();
    if (values.city) params.set('city', values.city);
    if (values.seller) params.set('seller', values.seller);
    if (values.property_type) params.set('property_type', values.property_type);
    if (values.min_price) params.set('min_price', values.min_price);
    if (values.max_price) params.set('max_price', values.max_price);
    if (values.rooms) params.set('rooms', values.rooms);
    if (newOffset > 0) params.set('offset', String(newOffset));
    const qs = params.toString();
    return `/${locale}/properties${qs ? `?${qs}` : ''}`;
  }

  const showPrev = offset > 0;
  const showNext = properties.length === PAGE_SIZE;

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
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PropertyFilters initial={values} />
        </aside>

        <main>
          {properties.length === 0 ? (
            <div className="text-center py-16 px-6 bg-surface-card border border-border-subtle rounded-xl">
              <p className="text-text-secondary mb-4">{hasFilters ? t('noResults') : t('emptyState')}</p>
              {!hasFilters && (
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

              {(showPrev || showNext) && (
                <div className="mt-8 flex items-center justify-between">
                  {showPrev ? (
                    <Link
                      href={pageHref(Math.max(0, offset - PAGE_SIZE))}
                      className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
                    >
                      ← {t('previous')}
                    </Link>
                  ) : (
                    <span />
                  )}
                  {showNext && (
                    <Link
                      href={pageHref(offset + PAGE_SIZE)}
                      className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
                    >
                      {t('next')} →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
