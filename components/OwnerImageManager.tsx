'use client';

import {useTranslations} from 'next-intl';
import {useAuth} from '@/components/AuthProvider';
import PropertyImageGallery from '@/components/PropertyImageGallery';
import type {PropertyImage} from '@/lib/properties';

// Owner-only photo management. The public read-only photo grid is rendered
// server-side for crawlers; this island adds upload/reorder/delete on top,
// visible only to the listing's owner.
export default function OwnerImageManager({
  propertyId,
  ownerId,
  initialImages
}: {
  propertyId: string;
  ownerId: string;
  initialImages: PropertyImage[];
}) {
  const t = useTranslations('PropertyDisplay');
  const {user} = useAuth();

  if (!user || user.id !== ownerId) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border-subtle">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
        {t('imagesSection')}
      </h3>
      <PropertyImageGallery propertyId={propertyId} initialImages={initialImages} />
    </div>
  );
}
