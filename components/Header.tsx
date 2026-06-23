'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import {listConversations} from '@/lib/conversations';

const UNREAD_POLL_INTERVAL_MS = 30_000;

export default function Header() {
  const t = useTranslations('Navigation');
  const tInbox = useTranslations('Inbox');
  const tAuth = useTranslations('Auth.header');
  const tAdmin = useTranslations('Admin');
  const {user, isLoading, logout} = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread count every 30s while user is signed in.
  // Also refetches whenever the user identity changes (sign in/out).
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    async function fetchUnread() {
      try {
        const conversations = await listConversations();
        if (cancelled) return;
        const count = conversations.filter((c) => c.has_unread).length;
        setUnreadCount(count);
      } catch (err) {
        // Silent fail — header badge isn't critical. Don't spam errors.
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.debug('Could not fetch unread count:', err);
        }
      }
    }

    // Initial fetch
    fetchUnread();

    // Then poll
    const intervalId = setInterval(fetchUnread, UNREAD_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user]);

  return (
    <header className="border-b border-border-subtle bg-surface-card">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-text-primary">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-navy text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5 12 3l9 6.5" />
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
            </svg>
          </span>
          DarSyria
        </Link>
        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-4 md:order-none md:w-auto md:gap-6">
          <Link href="/" className="text-text-secondary hover:text-text-primary">{t('home')}</Link>
          <Link href="/properties" className="text-text-secondary hover:text-text-primary">{t('properties')}</Link>
          <Link href="/knowledge" className="text-text-secondary hover:text-text-primary">{t('knowledgeBase')}</Link>
          <Link href="/assistant" className="text-text-secondary hover:text-text-primary">{t('aiAssistant')}</Link>
          {user && (
            <Link
              href="/inbox"
              className="relative text-text-secondary hover:text-text-primary"
              aria-label={
                unreadCount > 0
                  ? tInbox('unreadBadge', {count: unreadCount})
                  : tInbox('navLink')
              }
            >
              {tInbox('navLink')}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -end-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-navy rounded-full"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          {user?.is_admin && (
            <Link
              href="/admin"
              className="text-text-secondary hover:text-text-primary font-medium"
            >
              {tAdmin('navLink')}
            </Link>
          )}
        </nav>
        <div className="flex min-w-0 items-center gap-3">
          {!isLoading && (user ? (
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/account"
                className="max-w-[180px] truncate text-sm text-text-secondary hover:text-text-primary hover:underline"
              >
                {user.full_name ?? user.email}
              </Link>
              <button onClick={logout} className="text-sm text-text-secondary underline hover:text-text-primary">
                {tAuth('signOut')}
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors">
              {tAuth('signIn')}
            </Link>
          ))}
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
