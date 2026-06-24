'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {
  publishProperty,
  unpublishProperty,
  deleteProperty,
  type Property
} from '@/lib/properties';

// Owner-only controls for a listing detail page. Renders nothing unless the
// signed-in user owns the listing. After a status change it calls
// router.refresh() so the server-rendered page (badges, banners) re-syncs.
export default function OwnerPropertyControls({property}: {property: Property}) {
  const t = useTranslations('PropertyDisplay');
  const router = useRouter();
  const {user} = useAuth();

  const [statusAction, setStatusAction] = useState<'publishing' | 'unpublishing' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user || user.id !== property.owner_id) return null;

  const isDraft = property.status === 'draft';
  const isActive = property.status === 'active';

  async function handlePublish() {
    if (statusAction) return;
    setStatusAction('publishing');
    setActionError(null);
    try {
      await publishProperty(property.id);
      router.refresh();
    } catch (e) {
      console.error('Publish failed:', e);
      setActionError(t('publishError'));
    } finally {
      setStatusAction(null);
    }
  }

  async function handleUnpublish() {
    if (statusAction) return;
    setStatusAction('unpublishing');
    setActionError(null);
    try {
      await unpublishProperty(property.id);
      router.refresh();
    } catch (e) {
      console.error('Unpublish failed:', e);
      setActionError(t('unpublishError'));
    } finally {
      setStatusAction(null);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteProperty(property.id);
      router.push('/properties');
    } catch (e) {
      console.error('Delete failed:', e);
      setActionError(t('deleteError'));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="mb-6">
      {/* Draft banner */}
      {isDraft && (
        <div className="mb-4 p-4 bg-accent-warning-bg border border-accent-warning/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-warning mb-1">{t('draftBannerTitle')}</p>
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

      {/* Published banner */}
      {isActive && (
        <div className="mb-4 p-4 bg-accent-verified-bg border border-accent-verified/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-verified mb-1">{t('publishedBannerTitle')}</p>
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

      {/* Edit / delete */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/properties/${property.id}/edit`}
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

      {actionError && (
        <div className="mt-4 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
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
            <h3 className="text-lg font-semibold text-text-primary mb-2">{t('deleteConfirmTitle')}</h3>
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
    </div>
  );
}
