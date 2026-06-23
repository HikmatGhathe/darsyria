'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  listConversations,
  type ConversationListItem,
} from '@/lib/conversations';
import { ApiError } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatTime';

export default function InboxPage() {
  const t = useTranslations('Inbox');
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';

  const [conversations, setConversations] = useState<ConversationListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listConversations();
        if (!cancelled) setConversations(data);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load conversations:', err);
          // 401 means not logged in — bounce to login
          if (err instanceof ApiError && err.status === 401) {
            router.push(`/${locale}/login?next=/inbox`);
            return;
          }
          setError(t('loadError'));
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locale, router, t]);

  // Loading state
  if (conversations === null && !error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">{t('pageTitle')}</h1>
        <div className="text-sm text-text-secondary">{t('loading')}</div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">{t('pageTitle')}</h1>
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{error}</p>
        </div>
      </main>
    );
  }

  // Empty state
  if (conversations && conversations.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">{t('pageTitle')}</h1>
        <div className="text-center py-12 px-4 bg-surface-page rounded-xl border border-border-subtle">
          <svg
            className="w-12 h-12 mx-auto text-text-tertiary mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
          <p className="text-sm text-text-secondary mb-2">{t('empty')}</p>
          <p className="text-xs text-text-tertiary mb-4">{t('emptyBuyerHint')}</p>
          <Link
            href={`/${locale}/properties`}
            className="inline-block px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover transition-colors"
          >
            {t('browseProperties')}
          </Link>
        </div>
      </main>
    );
  }

  // Normal state: list of conversations
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-text-primary mb-6">{t('pageTitle')}</h1>

      <ul className="divide-y divide-border-subtle bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
        {conversations!.map((conv) => (
          <li key={conv.id}>
            <Link
              href={`/${locale}/inbox/${conv.id}`}
              className="flex items-center gap-4 p-4 hover:bg-surface-page transition-colors"
            >
              {/* Property cover thumbnail */}
              <div className="flex-shrink-0 w-16 h-16 bg-surface-page rounded-lg overflow-hidden">
                {conv.property_cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conv.property_cover_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                    <svg
                      className="w-6 h-6"
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
              </div>

              {/* Conversation info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  {/* Unread dot */}
                  {conv.has_unread && (
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-navy"
                      aria-label="Unread"
                    />
                  )}
                  <h2
                    className={`text-sm truncate ${
                      conv.has_unread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
                    }`}
                  >
                    {conv.other_party.name || 'User'}
                  </h2>
                  <span className="ms-auto flex-shrink-0 text-xs text-text-tertiary">
                    {formatRelativeTime(conv.last_message_at, t, locale)}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary truncate mb-1">{conv.property_title}</p>
                <p
                  className={`text-sm truncate ${
                    conv.has_unread ? 'font-medium text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {conv.last_message_preview || ''}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
