'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import LanguageSwitcher from './LanguageSwitcher';
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
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          DarSyria
        </Link>
        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-4 md:order-none md:w-auto md:gap-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900">{t('home')}</Link>
          <Link href="/properties" className="text-gray-700 hover:text-gray-900">{t('properties')}</Link>
          <Link href="/knowledge" className="text-gray-700 hover:text-gray-900">{t('knowledgeBase')}</Link>
          <Link href="/assistant" className="text-gray-700 hover:text-gray-900">{t('aiAssistant')}</Link>
          {user && (
            <Link
              href="/inbox"
              className="relative text-gray-700 hover:text-gray-900"
              aria-label={
                unreadCount > 0
                  ? tInbox('unreadBadge', {count: unreadCount})
                  : tInbox('navLink')
              }
            >
              {tInbox('navLink')}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -end-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full"
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
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {tAdmin('navLink')}
            </Link>
          )}
        </nav>
        <div className="flex min-w-0 items-center gap-4">
          {!isLoading && (user ? (
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/account"
                className="max-w-[180px] truncate text-sm text-gray-700 hover:text-gray-900 hover:underline"
              >
                {user.full_name ?? user.email}
              </Link>
              <button onClick={logout} className="text-sm text-gray-600 underline hover:text-gray-900">
                {tAuth('signOut')}
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              {tAuth('signIn')}
            </Link>
          ))}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
