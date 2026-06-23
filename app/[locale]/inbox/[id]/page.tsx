'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  getConversation,
  markConversationRead,
  sendMessage,
  revealContact,
  type Conversation,
} from '@/lib/conversations';
import { ApiError } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatTime';

const POLL_INTERVAL_MS = 5_000;

export default function ThreadPage() {
  const t = useTranslations('Thread');
  // NOTE: formatRelativeTime expects keys from the Inbox namespace
  // (relativeJustNow, relativeMinutesAgo, etc.). If those keys ever move
  // to a dedicated Time namespace, update this reference too.
  const tInbox = useTranslations('Inbox');
  const locale = useLocale();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(
    async (showError = true) => {
      try {
        const data = await getConversation(id);
        setConversation(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Not signed in — middleware will redirect; stop polling silently.
          return;
        }
        if (showError) setLoadError(t('loadError'));
      }
    },
    [id, t]
  );

  // ─── Poll — pauses when tab is hidden ─────────────────────────────────────
  useEffect(() => {
    load(true);

    let interval: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (interval) return;
      interval = setInterval(() => load(false), POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        // Tab became visible — fetch immediately, then resume polling.
        load(false);
        startPolling();
      }
    }

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [load]);

  // ─── Mark as read whenever unread messages from the other party exist ──────
  // The ref guard is removed: the endpoint is idempotent, and new messages
  // arriving via polling would stay "unread" forever with a one-shot guard.
  useEffect(() => {
    if (!conversation || !user) return;

    const hasUnread = conversation.messages.some(
      (m) => m.sender_id !== user.id && m.read_at === null
    );

    if (hasUnread) {
      markConversationRead(id).catch(() => {});
    }
  }, [conversation, user, id]);

  // ─── Scroll to bottom only when message count grows ────────────────────────
  const prevMessageCount = useRef(0);
  useEffect(() => {
    const count = conversation?.messages.length ?? 0;
    if (count !== prevMessageCount.current) {
      prevMessageCount.current = count;
      messagesEndRef.current?.scrollIntoView({
        behavior: count === 1 ? 'auto' : 'smooth',
      });
    }
  }, [conversation?.messages.length]);

  // ─── Send (optimistic clear) ───────────────────────────────────────────────
  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setSendError(null);
    setDraft(''); // Clear immediately so the user can start typing the next message.

    try {
      await sendMessage(id, body);
      await load(false);
    } catch {
      setDraft(body); // Restore on failure so the user doesn't lose their text.
      setSendError(t('sendError'));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Accept both Ctrl+Enter (Windows/Linux) and Cmd+Enter (Mac).
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  // ─── Reveal ─────────────────────────────────────────────────────────────────
  async function handleReveal() {
    if (revealing) return;
    setRevealing(true);
    try {
      const updated = await revealContact(id);
      setConversation(updated);
    } catch {
      await load(false);
    } finally {
      setRevealing(false);
    }
  }

  // ─── Loading / error states ─────────────────────────────────────────────────
  if (loadError) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/inbox"
          className="text-sm text-brand-navy hover:underline mb-6 inline-block"
        >
          ← {t('backToInbox')}
        </Link>
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-text-secondary">{t('loading')}</p>
      </main>
    );
  }

  // ─── Reveal logic ────────────────────────────────────────────────────────────
  const isBuyer = user?.id === conversation.buyer_id;
  const myRevealed = isBuyer
    ? conversation.buyer_revealed_at
    : conversation.seller_revealed_at;
  const theirPhone = isBuyer ? conversation.seller_phone : conversation.buyer_phone;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Header */}
      <div>
        <Link
          href="/inbox"
          className="text-sm text-brand-navy hover:underline inline-flex items-center gap-1 mb-3"
        >
          ← {t('backToInbox')}
        </Link>
        <h1 className="text-xl font-semibold text-text-primary leading-snug">
          {conversation.property_title}
        </h1>
      </div>

      {/* Message list */}
      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-y-auto max-h-[55vh] p-4 flex flex-col gap-3">
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">{t('noMessages')}</p>
          ) : (
            conversation.messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isOwn
                        ? 'bg-brand-navy text-white rounded-br-none'
                        : 'bg-surface-page text-text-primary rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.body}
                    </p>
                    <p
                      className={`text-[10px] mt-1.5 ${
                        isOwn ? 'text-white/70 text-right' : 'text-text-tertiary'
                      }`}
                    >
                      {formatRelativeTime(msg.created_at, tInbox, locale)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Contact reveal panel */}
      {conversation.both_revealed ? (
        <div className="bg-accent-verified-bg border border-accent-verified/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-accent-verified mb-1">
            {t('revealDone')}
          </p>
          {theirPhone && (
            <p className="text-sm text-accent-verified">
              {t('theirPhone')}:{' '}
              <a
                href={`tel:${theirPhone}`}
                className="font-mono hover:underline"
                dir="ltr"
              >
                {theirPhone}
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="bg-surface-page border border-border-subtle rounded-xl p-4">
          <p className="text-sm font-semibold text-text-primary mb-1">
            {t('revealTitle')}
          </p>
          <p className="text-xs text-text-secondary mb-3">{t('revealBody')}</p>

          {myRevealed ? (
            <p className="text-xs text-accent-warning bg-accent-warning-bg border border-accent-warning/30 rounded-lg px-3 py-2">
              {t('revealPending')}
            </p>
          ) : user?.phone ? (
            <button
              onClick={handleReveal}
              disabled={revealing}
              className="text-sm px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover disabled:opacity-60 transition-colors"
            >
              {revealing ? '…' : t('revealButton')}
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs text-text-secondary">{t('revealNeedPhone')}</p>
              <Link
                href="/account"
                className="text-xs text-brand-navy hover:underline font-medium"
              >
                {t('goToProfile')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-col gap-3">
        {sendError && (
          <p className="text-xs text-accent-danger">{sendError}</p>
        )}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('messagePlaceholder')}
          rows={3}
          className="w-full resize-none rounded-lg border border-border-subtle bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary hidden sm:block">
            {t('ctrlEnterHint')}
          </p>
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="ms-auto px-5 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 transition-colors"
          >
            {sending ? t('sending') : t('send')}
          </button>
        </div>
      </div>

    </main>
  );
}
