'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import type {PropertyListItem} from '@/lib/properties';
import {
  formatPrice,
  propertyTypeKey,
  documentStatusInfo,
  formatLocation
} from '@/lib/property-display';

export default function PropertyCard({
  property,
  locale
}: {
  property: PropertyListItem;
  locale: string;
}) {
  const t = useTranslations('PropertyDisplay');
  const tVerify = useTranslations('Properties.verification');
  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-surface-card text-brand-navy border-brand-navy/30',
    amber: 'bg-accent-warning-bg text-accent-warning border-accent-warning/30',
    gray: 'bg-surface-card text-text-secondary border-border-subtle'
  };

  return (
    <Link
      href={`/${locale}/properties/${property.id}`}
      className="block bg-surface-card border border-border-subtle rounded-xl hover:border-border-strong hover:-translate-y-0.5 transition overflow-hidden"
    >
      {/* Cover image or placeholder */}
      <div className="relative aspect-[4/3] bg-surface-page overflow-hidden">
        {property.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.cover_image_url}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
        )}

        {/* Verified badge — browse endpoint only ever returns active (admin-approved) listings */}
        <span className="absolute top-2 start-2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {tVerify('verified')}
        </span>

        <span
          className={`absolute top-2 end-2 inline-block px-2 py-0.5 text-xs font-medium border rounded-full backdrop-blur-sm bg-opacity-90 ${badgeColors[docInfo.color]}`}
        >
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>

        <FavoriteButton propertyId={property.id} className="absolute bottom-2 end-2 shadow-sm" />
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-text-primary line-clamp-2 mb-2">
          {property.title}
        </h3>
        <p className="text-sm text-text-secondary mb-3 flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {formatLocation(property.city, property.neighborhood, locale)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-text-primary">
            {formatPrice(property.price_amount, locale)}
          </span>
          <span className="text-xs text-text-tertiary">
            {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
            {property.rooms != null && ` · ${t('rooms', {count: property.rooms})}`}
            {property.area_sqm != null && ` · ${t('areaSqm', {value: property.area_sqm})}`}
          </span>
        </div>
        {property.seller_display_name && (
          <p className="mt-2 pt-2 border-t border-border-subtle text-xs text-text-tertiary flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
              <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
            </svg>
            {t('postedBy', {name: property.seller_display_name})}
            {property.seller_account_type === 'company' && property.seller_verification_status === 'verified' && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent-verified" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
