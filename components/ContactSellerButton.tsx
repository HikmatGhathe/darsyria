'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from './AuthProvider';
import {
  getMyConversationForProperty,
  startConversation,
  type Conversation,
} from '@/lib/conversations';

type Props = {
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
};

export default function ContactSellerButton({
  propertyId,
  propertyTitle,
  ownerId,
}: Props) {
  const t = useTranslations('PropertyDisplay');
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [existingConversation, setExistingConversation] = useState<Conversation | null>(null);
  const [lookupDone, setLookupDone] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount (or when user changes), look up existing conversation
  useEffect(() => {
    let cancelled = false;

    async function lookup() {
      if (!user) {
        if (!cancelled) {
          setExistingConversation(null);
          setLookupDone(true);
        }
        return;
      }
      try {
        const conv = await getMyConversationForProperty(propertyId);
        if (!cancelled) {
          setExistingConversation(conv);
          setLookupDone(true);
        }
      } catch (err) {
        if (!cancelled) {
          // Silent fail — show primary "Contact seller" button as fallback
          console.debug('Could not look up conversation:', err);
          setExistingConversation(null);
          setLookupDone(true);
        }
      }
    }

    lookup();
    return () => { cancelled = true; };
  }, [propertyId, user]);

  // Owner viewing their own property — hide entirely
  if (user && user.id === ownerId) {
    return null;
  }

  // Auth loading or lookup in flight — skeleton to avoid layout jump
  if (authLoading || !lookupDone) {
    return (
      <button
        disabled
        className="w-full px-6 py-3 bg-surface-page text-text-tertiary text-sm font-medium rounded-lg cursor-not-allowed"
      >
        ...
      </button>
    );
  }

  // Not signed in — link to login with return URL
  if (!user) {
    return (
      <Link
        href={`/login?next=/properties/${propertyId}`}
        className="block w-full px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-hover transition-colors text-center"
      >
        {t('contactSellerSignedOut')}
      </Link>
    );
  }

  // Signed in + existing conversation — link directly to thread
  if (existingConversation) {
    return (
      <Link
        href={`/inbox/${existingConversation.id}`}
        className="block w-full px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-hover transition-colors text-center"
      >
        {t('openConversation')}
      </Link>
    );
  }

  // Signed in, no existing conversation — open compose modal
  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const conv = await startConversation(propertyId, body);
      router.push(`/inbox/${conv.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(t('contactModalError'));
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full px-6 py-3 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-hover transition-colors"
      >
        {t('contactSeller')}
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !sending && setModalOpen(false)}
        >
          <div
            className="bg-surface-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {t('contactModalTitle')}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t('contactModalSubject', { propertyTitle })}
            </p>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('contactModalPlaceholder')}
              rows={5}
              maxLength={4000}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              disabled={sending}
              className="w-full px-3 py-2 bg-surface-card border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-navy focus:border-brand-navy resize-none disabled:bg-surface-page disabled:cursor-not-allowed"
            />

            {error && (
              <div className="mt-3 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
                <p className="text-sm text-accent-danger">{error}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                disabled={sending}
                className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed transition-colors"
              >
                {t('contactModalCancel')}
              </button>
              <button
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                className="px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? t('contactModalSending') : t('contactModalSend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
