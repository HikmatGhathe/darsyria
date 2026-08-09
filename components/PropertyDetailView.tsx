import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import ContactSellerButton from '@/components/ContactSellerButton';
import FollowButton from '@/components/FollowButton';
import FavoriteButton from '@/components/FavoriteButton';
import ReportButton from '@/components/ReportButton';
import OwnerPropertyControls from '@/components/OwnerPropertyControls';
import OwnerImageManager from '@/components/OwnerImageManager';
import PropertyGallery from '@/components/PropertyGallery';
import PropertyMap from '@/components/PropertyMap';
import VerificationBadge from '@/components/VerificationBadge';
import type {Property} from '@/lib/properties';
import {GOVERNORATE_KEYS, governorateCenter, type GovernorateKey} from '@/lib/governorates';
import {
  formatPrice,
  propertyTypeKey,
  documentStatusInfo,
  formatLocation,
  formatListedDate
} from '@/lib/property-display';

// Presentational listing view — no data fetching, no 'use client'. Rendered
// server-side by the detail page (crawlable HTML) and reused by the client
// draft fallback. Interactive, auth-dependent pieces are nested client
// islands (owner controls, image manager, contact, follow), each of which
// self-hides when not relevant to the viewer.
export default function PropertyDetailView({property}: {property: Property}) {
  const t = useTranslations('PropertyDisplay');
  const tGov = useTranslations('Governorates');
  const locale = useLocale();

  const govKey = property.governorate as GovernorateKey | null;
  const govLabel = govKey && GOVERNORATE_KEYS.includes(govKey) ? tGov(govKey) : null;
  const hasPin = property.latitude != null && property.longitude != null;
  const showMap = hasPin || govLabel != null;

  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-surface-card text-brand-navy border-brand-navy/30',
    amber: 'bg-accent-warning-bg text-accent-warning border-accent-warning/30',
    gray: 'bg-surface-card text-text-secondary border-border-subtle'
  };
  const images = property.images ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${locale}/properties`}
          className="text-sm text-text-tertiary hover:text-text-primary mb-3 inline-block"
        >
          ← {t('backToListings')}
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-text-primary">{property.title}</h1>
          <VerificationBadge
            verificationStatus={property.verification_status}
            sellerAccountType={property.seller_account_type}
            sellerVerificationStatus={property.seller_verification_status}
          />
        </div>
        <p className="text-text-secondary flex items-center gap-1 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {formatLocation(property.city, property.neighborhood, locale)}
          {govLabel && <span className="text-text-tertiary"> · {govLabel}</span>}
        </p>
        {property.seller_display_name && (
          <Link
            href={`/${locale}/sellers/${property.owner_id}`}
            className="text-sm text-text-tertiary hover:text-brand-navy flex items-center gap-1 w-fit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
              <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
            </svg>
            {t('postedBy', {name: property.seller_display_name})}
          </Link>
        )}
      </div>

      {/* Owner-only controls (client island, self-hides for non-owners) */}
      <OwnerPropertyControls property={property} />

      {/* Price + document badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border-subtle">
        <div className="text-3xl font-semibold text-brand-navy">
          {formatPrice(property.price_amount, locale)}
        </div>
        <span className={`inline-block px-3 py-1 text-sm font-medium border rounded-full ${badgeColors[docInfo.color]}`}>
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Details grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('details')}</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{t('labelType')}</dt>
            <dd className="text-base font-medium text-text-primary">
              {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
            </dd>
          </div>
          {property.rooms !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{t('labelRooms')}</dt>
              <dd className="text-base font-medium text-text-primary">{t('rooms', {count: property.rooms})}</dd>
            </div>
          )}
          {property.bathrooms !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{t('labelBathrooms')}</dt>
              <dd className="text-base font-medium text-text-primary">{t('bathrooms', {count: property.bathrooms})}</dd>
            </div>
          )}
          {property.area_sqm !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{t('labelArea')}</dt>
              <dd className="text-base font-medium text-text-primary">{t('areaSqm', {value: property.area_sqm})}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Location map — pin if set, otherwise the governorate's general area.
          Leaflet hydrates client-side; nothing renders server-side but the box. */}
      {showMap && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3">{t('locationSection')}</h2>
          <PropertyMap
            lat={property.latitude}
            lng={property.longitude}
            centroid={governorateCenter(govKey)}
          />
          {!hasPin && <p className="text-xs text-text-tertiary mt-2">{t('mapApproxNote')}</p>}
        </section>
      )}

      {/* Photos — the gallery renders the crawlable grid (server-rendered even
          as a client component) plus a click-to-open lightbox with prev/next.
          The owner gets management controls below via the OwnerImageManager. */}
      <section className="mb-8">
        {images.length > 0 ? (
          <PropertyGallery images={images} title={property.title} />
        ) : (
          <div className="aspect-[2/1] w-full rounded-xl bg-surface-page flex items-center justify-center text-text-tertiary">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        <OwnerImageManager propertyId={property.id} ownerId={property.owner_id} initialImages={images} />
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3">{t('description')}</h2>
        <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{property.description}</p>
      </section>

      {/* Contact + follow (client islands, each self-hides for the owner) */}
      <section className="pt-6 border-t border-border-subtle flex flex-wrap gap-3 items-start">
        <div className="flex-1 min-w-[200px]">
          <ContactSellerButton
            propertyId={property.id}
            propertyTitle={property.title}
            ownerId={property.owner_id}
          />
        </div>
        <FavoriteButton propertyId={property.id} withLabel />
        <FollowButton sellerId={property.owner_id} locale={locale} />
      </section>

      {/* Listed date + report */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs text-text-tertiary">
          {t('listedOn', {date: formatListedDate(property.created_at, locale)})}
        </p>
        <ReportButton propertyId={property.id} ownerId={property.owner_id} />
      </div>
    </div>
  );
}
