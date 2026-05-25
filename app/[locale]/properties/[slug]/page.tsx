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
      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-500">Loading...</div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">{t('notFoundTitle')}</h1>
        <p className="text-gray-600 mb-6">{t('notFoundMessage')}</p>
        <Link href={`/${locale}/properties`} className="text-blue-600 hover:underline">
          ← {t('backToListings')}
        </Link>
      </div>
    );
  }

  const docInfo = documentStatusInfo(property.document_status);
  const badgeColors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
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
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-block"
        >
          ← {t('backToListings')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <p className="text-gray-600">
          {formatLocation(property.city, property.neighborhood, locale)}
        </p>
      </div>

      {/* Owner-only draft banner */}
      {isOwner && isDraft && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              {t('draftBannerTitle')}
            </p>
            <p className="text-xs text-amber-800">{t('draftBannerBody')}</p>
          </div>
          <button
            onClick={handlePublish}
            disabled={statusAction !== null}
            className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap transition"
          >
            {statusAction === 'publishing' ? t('publishing') : t('publishNow')}
          </button>
        </div>
      )}

      {/* Owner-only published controls */}
      {isOwner && isActive && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-green-900 mb-1">
              {t('publishedBannerTitle')}
            </p>
            <p className="text-xs text-green-800">{t('publishedBannerBody')}</p>
          </div>
          <button
            onClick={handleUnpublish}
            disabled={statusAction !== null}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:cursor-not-allowed whitespace-nowrap transition"
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
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
          >
            {t('edit')}
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50 disabled:cursor-not-allowed transition"
          >
            {t('delete')}
          </button>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{t('deleteConfirmBody')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:cursor-not-allowed transition"
              >
                {t('deleteCancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isDeleting ? t('deleting') : t('deleteConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price + document badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div className="text-3xl font-bold text-gray-900">
          {formatPrice(property.price_amount, property.price_currency, locale)}
        </div>
        <span
          className={`inline-block px-3 py-1 text-sm font-medium border rounded-full ${badgeColors[docInfo.color]}`}
        >
          {t(docInfo.key as Parameters<typeof t>[0])}
        </span>
      </div>

      {/* Details grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('details')}</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {t('labelType')}
            </dt>
            <dd className="text-base font-medium text-gray-900">
              {t(propertyTypeKey(property.property_type) as Parameters<typeof t>[0])}
            </dd>
          </div>
          {property.rooms !== null && (
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {t('labelRooms')}
              </dt>
              <dd className="text-base font-medium text-gray-900">
                {t('rooms', {count: property.rooms})}
              </dd>
            </div>
          )}
          {property.bathrooms !== null && (
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {t('labelBathrooms')}
              </dt>
              <dd className="text-base font-medium text-gray-900">
                {t('bathrooms', {count: property.bathrooms})}
              </dd>
            </div>
          )}
          {property.area_sqm !== null && (
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {t('labelArea')}
              </dt>
              <dd className="text-base font-medium text-gray-900">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('imagesSection')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(property.images ?? []).map((img) => (
                <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.public_url}
                    alt={img.original_filename || ''}
                    className="w-full h-full object-cover"
                  />
                  {img.position === 0 && (
                    <span className="absolute top-2 start-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {t('coverBadge')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('description')}</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {property.description}
        </p>
      </section>

      {/* Verification disclaimer */}
      <section className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">{t('docDisclaimer')}</p>
      </section>

      {/* Contact seller */}
      {!isOwner && (
        <section className="pt-6 border-t border-gray-200">
          <ContactSellerButton
            propertyId={property.id}
            propertyTitle={property.title}
            ownerId={property.owner_id}
          />
        </section>
      )}

      {/* Listed date */}
      <p className="text-xs text-gray-400 mt-8">
        {t('listedOn', {date: formatListedDate(property.created_at, locale)})}
      </p>
    </div>
  );
}
