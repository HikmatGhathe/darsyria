'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import {createReport, type ReportReason} from '@/lib/reports';

const REASONS: ReportReason[] = ['scam', 'spam', 'offensive', 'inaccurate', 'other'];

// Subtle "Report" link + modal, self-contained like FollowButton. Pass either
// propertyId or sellerId for the target, and ownerId (the id that, if it's the
// current user, hides the button — your own listing or your own profile).
export default function ReportButton({
  propertyId,
  sellerId,
  ownerId
}: {
  propertyId?: string;
  sellerId?: string;
  ownerId: string;
}) {
  const t = useTranslations('Report');
  const router = useRouter();
  const {user} = useAuth();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('scam');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done'>('idle');

  if (user && user.id === ownerId) return null;

  function handleOpen() {
    if (!user) {
      router.push('/login');
      return;
    }
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setState('idle');
    setReason('scam');
    setDetails('');
  }

  async function submit() {
    if (state === 'submitting') return;
    setState('submitting');
    try {
      await createReport({
        reason,
        details: details.trim() || undefined,
        property_id: propertyId,
        reported_user_id: sellerId
      });
      setState('done');
    } catch (e) {
      console.error('Report failed:', e);
      setState('idle');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs text-text-tertiary hover:text-accent-danger underline underline-offset-2"
      >
        {t('report')}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => state !== 'submitting' && close()}
        >
          <div
            className="bg-surface-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {state === 'done' ? (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('thanksTitle')}</h3>
                <p className="text-sm text-text-secondary mb-6">{t('thanksBody')}</p>
                <div className="flex justify-end">
                  <button
                    onClick={close}
                    className="px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover transition-colors"
                  >
                    {t('close')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{t('title')}</h3>
                <p className="text-sm text-text-secondary mb-4">{t('subtitle')}</p>

                <label className="block text-sm font-medium text-text-secondary mb-1">{t('reasonLabel')}</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="w-full mb-4 px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {t(`reasons.${r}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-text-secondary mb-1">{t('detailsLabel')}</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder={t('detailsPlaceholder')}
                  className="w-full mb-4 px-3 py-2 text-sm bg-surface-card border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy resize-y"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={close}
                    disabled={state === 'submitting'}
                    className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={submit}
                    disabled={state === 'submitting'}
                    className="px-4 py-2 bg-accent-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {state === 'submitting' ? t('submitting') : t('submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
