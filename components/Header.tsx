'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth.header');
  const {user, isLoading, logout} = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          DarSyria
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-4 md:order-none md:w-auto md:gap-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            {t('home')}
          </Link>
          <Link href="/properties" className="text-gray-700 hover:text-gray-900">
            {t('properties')}
          </Link>
          <Link href="/knowledge" className="text-gray-700 hover:text-gray-900">
            {t('knowledgeBase')}
          </Link>
          <Link href="/assistant" className="text-gray-700 hover:text-gray-900">
            {t('aiAssistant')}
          </Link>
        </nav>

        <div className="flex min-w-0 items-center gap-4">
          {!isLoading &&
            (user ? (
              <div className="flex min-w-0 items-center gap-3">
                <span className="max-w-[180px] truncate text-sm text-gray-700">
                  {user.full_name ?? user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 underline hover:text-gray-900"
                >
                  {tAuth('signOut')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {tAuth('signIn')}
              </Link>
            ))}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
