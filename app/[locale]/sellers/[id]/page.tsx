import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import PropertyCard from '@/components/PropertyCard';
import FollowButton from '@/components/FollowButton';
import {getSellerServer} from '@/lib/server-api';
import {formatListedDate} from '@/lib/property-display';
import {SITE_URL} from '@/lib/site';

type Params = Promise<{locale: string; id: string}>;

function localeAlternates(id: string): Record<string, string> {
  return {
    en: `${SITE_URL}/en/sellers/${id}`,
    de: `${SITE_URL}/de/sellers/${id}`,
    ar: `${SITE_URL}/ar/sellers/${id}`
  };
}

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale, id} = await params;
  const seller = await getSellerServer(id);

  if (!seller) {
    const t = await getTranslations({locale, namespace: 'Sellers'});
    return {title: t('profileNotFoundTitle'), robots: {index: false}};
  }

  const t = await getTranslations({locale, namespace: 'Sellers'});
  const name = seller.display_name ?? t('unknownSeller');
  const description =
    seller.company_about?.replace(/\s+/g, ' ').trim().slice(0, 155) ||
    t('activeListings', {count: seller.active_listing_count});
  const url = `${SITE_URL}/${locale}/sellers/${seller.id}`;

  return {
    title: name,
    description,
    alternates: {canonical: url, languages: localeAlternates(seller.id)},
    openGraph: {type: 'profile', url, title: name, description},
    twitter: {card: 'summary', title: name, description}
  };
}

export default async function SellerProfilePage({params}: {params: Params}) {
  const {locale, id} = await params;
  const seller = await getSellerServer(id);

  if (!seller) notFound();

  const t = await getTranslations({locale, namespace: 'Sellers'});
  const tProperty = await getTranslations({locale, namespace: 'PropertyDisplay'});
  const tAccount = await getTranslations({locale, namespace: 'Account'});

  const isCompany = seller.account_type === 'company';
  const isVerified = seller.verification_status === 'verified';
  const url = `${SITE_URL}/${locale}/sellers/${seller.id}`;

  const jsonLd =
    isCompany && seller.display_name
      ? {
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          name: seller.display_name,
          url,
          ...(seller.company_address ? {address: seller.company_address} : {}),
          ...(seller.phone ? {telephone: seller.phone} : {}),
          ...(seller.company_website ? {sameAs: [seller.company_website]} : {})
        }
      : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      )}

      <Link
        href={`/${locale}/properties`}
        className="text-sm text-text-tertiary hover:text-text-primary mb-3 inline-block"
      >
        ← {tProperty('backToListings')}
      </Link>

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-text-primary">
            {seller.display_name ?? t('unknownSeller')}
          </h1>
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('verifiedSeller')}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-4">
          {isCompany ? tAccount('accountTypeCompany') : tAccount('accountTypeIndividual')}
          {' · '}
          {t('memberSince', {date: formatListedDate(seller.member_since, locale)})}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-text-secondary">
            {t('activeListings', {count: seller.active_listing_count})}
          </span>
          <span className="text-sm text-text-secondary">
            {t('followers', {count: seller.follower_count})}
          </span>
          {!seller.is_self && (
            <FollowButton
              sellerId={seller.id}
              locale={locale}
              initialFollowing={seller.is_following}
            />
          )}
        </div>
      </div>

      {/* Company contact info — shown plainly, no consent gate, since a
          business wants to be found. Individuals never expose phone/address
          here; that stays behind the mutual-consent reveal in conversations. */}
      {isCompany && (seller.company_address || seller.phone || seller.company_website || seller.company_about) && (
        <section className="mb-8 p-5 bg-surface-card border border-border-subtle rounded-xl">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {t('companyInfoHeading')}
          </h2>
          <dl className="space-y-2 text-sm">
            {seller.company_address && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{tAccount('companyAddress')}:</dt>
                <dd className="text-text-primary whitespace-pre-wrap">{seller.company_address}</dd>
              </div>
            )}
            {seller.phone && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{tAccount('phone')}:</dt>
                <dd className="text-text-primary" dir="ltr">{seller.phone}</dd>
              </div>
            )}
            {seller.company_website && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{t('website')}:</dt>
                <dd className="text-text-primary">
                  <a
                    href={seller.company_website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-brand-navy hover:underline break-all"
                  >
                    {seller.company_website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {seller.company_about && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-1">
                {t('aboutHeading')}
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{seller.company_about}</p>
            </div>
          )}
        </section>
      )}

      {/* Listings */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('listingsHeading')}</h2>
        {seller.listings.length === 0 ? (
          <div className="text-center py-12 px-6 bg-surface-card border border-border-subtle rounded-xl text-text-secondary">
            {t('noListings')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seller.listings.map((p) => (
              <PropertyCard key={p.id} property={p} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
