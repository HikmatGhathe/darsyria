'use client';

import {useState, useEffect, useCallback} from 'react';
import {useParams} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useAuth} from '@/components/AuthProvider';
import {
  getProperty,
  publishProperty,
  unpublishProperty,
  deleteProperty,
  type Property,
  type PropertyImage
} from '@/lib/properties';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import ContactSellerButton from '@/components/ContactSellerButton';
import {
  formatPrice,
  propertyTypeKey,
  documentStatusInfo,
  formatLocation,
  formatListedDate
} from '@/lib/property-display';

export default function PropertyDetailPage() {
  const t = useTranslations('PropertyDisplay');
  const tVerify = useTranslations('Properties.verification');
  const locale = useLocale();
  const params = useParams();
  const id = (params.slug ?? params.id) as string;
  const {user} = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<'publishing' | 'unpublishing' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const p = await getProperty(id);
        if (!cancelled) setProperty(p);
      } catch (e) {
        if (!cancelled) {
          console.error('Load property failed:', e);
          setError('not_found');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handlePublish() {
    if (!property || statusAction) return;
    setStatusAction('publishing');
    setActionError(null);
    try {
      const updated = await publishProperty(property.id);
      setProperty(updated);
    } catch (e) {
      console.error('Publish failed:', e);
      setActionError(t('publishError'));
    } finally {
      setStatusAction(null);
    }
  }

  async function handleDelete() {
    if (!property || isDeleting) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteProperty(property.id);
      window.location.href = `/${locale}/properties`;
    } catch (e) {
      console.error('Delete failed:', e);
      setActionError(t('deleteError'));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleUnpublish() {
    if (!property || statusAction) return;
    setStatusAction('unpublishing');
    setActionError(null);
    try {
      const updated = await unpublishProperty(property.id);
      setProperty(updated);
    } catch (e) {
      console.error('Unpublish failed:', e);
      setActionError(t('unpublishError'));
    } finally {
      setStatusAction(null);
    }
  }

  const handleImagesChange = useCallback((images: PropertyImage[]) => {
    setProperty((prev) => prev ? {...prev, images} : prev);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-text-secondary">Loading...</div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">{t('notFoundTitle')}</h1>
        <p className="text-text-secondary mb-6">{t('notFoundMessage')}</p>
        <Link href={`/${locale}/properties`} className="text-brand-navy hover:underline">
          ← {t('backToListings')}
        </Link>
      </div>
    );
  }

  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-surface-card text-brand-navy border-brand-navy/30',
    amber: 'bg-accent-warning-bg text-accent-warning border-accent-warning/30',
    gray: 'bg-surface-card text-text-secondary border-border-subtle'
  };

  const isOwner = user?.id === property.owner_id;
  const isDraft = property.status === 'draft';
  const isActive = property.status === 'active';

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
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {tVerify('verified')}
            </span>
          )}
        </div>
        <p className="text-text-secondary flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {formatLocation(property.city, property.neighborhood, locale)}
        </p>
      </div>

      {/* Owner-only draft banner */}
      {isOwner && isDraft && (
        <div className="mb-6 p-4 bg-accent-warning-bg border border-accent-warning/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-warning mb-1">
              {t('draftBannerTitle')}
            </p>
            <p className="text-xs text-accent-warning">{t('draftBannerBody')}</p>
          </div>
          <button
            onClick={handlePublish}
            disabled={statusAction !== null}
            className="px-5 py-2 bg-accent-warning text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-opacity"
          >
            {statusAction === 'publishing' ? t('publishing') : t('publishNow')}
          </button>
        </div>
      )}

      {/* Owner-only published controls */}
      {isOwner && isActive && (
        <div className="mb-6 p-4 bg-accent-verified-bg border border-accent-verified/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-verified mb-1">
              {t('publishedBannerTitle')}
            </p>
            <p className="text-xs text-accent-verified">{t('publishedBannerBody')}</p>
          </div>
          <button
            onClick={handleUnpublish}
            disabled={statusAction !== null}
            className="px-5 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed whitespace-nowrap transition-colors"
          >
            {statusAction === 'unpublishing' ? t('unpublishing') : t('unpublish')}
          </button>
        </div>
      )}

      {/* Owner edit/delete controls */}
      {isOwner && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/properties/${property.id}/edit`}
            className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
          >
            {t('edit')}
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-surface-card border border-accent-danger/40 text-accent-danger text-sm font-medium rounded-lg hover:bg-accent-danger-bg disabled:cursor-not-allowed transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{actionError}</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-surface-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-text-secondary mb-6">{t('deleteConfirmBody')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed transition-colors"
              >
                {t('deleteCancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-accent-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isDeleting ? t('deleting') : t('deleteConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price + document badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border-subtle">
        <div className="text-3xl font-semibold text-brand-navy">
          {formatPrice(property.price_amount, locale)}
        </div>
        <span
          className={`inline-block px-3 py-1 text-sm font-medium border rounded-full ${badgeColors[docInfo.color]}`}
        >
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Details grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('details')}</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
              {t('labelType')}
            </dt>
            <dd className="text-base font-medium text-text-primary">
              {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
            </dd>
          </div>
          {property.rooms !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                {t('labelRooms')}
              </dt>
              <dd className="text-base font-medium text-text-primary">
                {t('rooms', {count: property.rooms})}
              </dd>
            </div>
          )}
          {property.bathrooms !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                {t('labelBathrooms')}
              </dt>
              <dd className="text-base font-medium text-text-primary">
                {t('bathrooms', {count: property.bathrooms})}
              </dd>
            </div>
          )}
          {property.area_sqm !== null && (
            <div>
              <dt className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                {t('labelArea')}
              </dt>
              <dd className="text-base font-medium text-text-primary">
                {t('areaSqm', {value: property.area_sqm})}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Photos */}
      <section className="mb-8">
        {isOwner ? (
          <PropertyImageGallery
            propertyId={property.id}
            initialImages={property.images ?? []}
            onImagesChange={handleImagesChange}
          />
        ) : (property.images ?? []).length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {t('imagesSection')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(property.images ?? []).map((img) => (
                <div key={img.id} className="relative aspect-square bg-surface-page rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.public_url}
                    alt={img.original_filename || ''}
                    className="w-full h-full object-cover"
                  />
                  {img.position === 0 && (
                    <span className="absolute top-2 start-2 px-2 py-0.5 bg-brand-navy text-white text-xs font-medium rounded-full">
                      {t('coverBadge')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="aspect-[2/1] w-full rounded-xl bg-surface-page flex items-center justify-center text-text-tertiary">
            <svg
              className="w-14 h-14"
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
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3">{t('description')}</h2>
        <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
          {property.description}
        </p>
      </section>

      {/* Verification disclaimer */}
      <section className="mb-8 p-4 bg-accent-warning-bg border border-accent-warning/30 rounded-lg">
        <p className="text-sm text-accent-warning">{t('docDisclaimer')}</p>
      </section>

      {/* Contact seller */}
      {!isOwner && (
        <section className="pt-6 border-t border-border-subtle">
          <ContactSellerButton
            propertyId={property.id}
            propertyTitle={property.title}
            ownerId={property.owner_id}
          />
        </section>
      )}

      {/* Listed date */}
      <p className="text-xs text-text-tertiary mt-8">
        {t('listedOn', {date: formatListedDate(property.created_at, locale)})}
      </p>
    </div>
  );
}
