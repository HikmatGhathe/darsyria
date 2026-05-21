'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useAuth} from '@/components/AuthProvider';
import {
  getProperty,
  publishProperty,
  unpublishProperty,
  type Property
} from '@/lib/properties';
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

      {actionError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{actionError}</p>
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

      {/* Contact (not yet wired) */}
      <section className="pt-6 border-t border-gray-200">
        <button
          disabled
          className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium"
        >
          {t('contactSeller')}
        </button>
        <p className="text-xs text-gray-500 mt-2 italic">{t('contactNote')}</p>
      </section>

      {/* Listed date */}
      <p className="text-xs text-gray-400 mt-8">
        {t('listedOn', {date: formatListedDate(property.created_at, locale)})}
      </p>
    </div>
  );
}
