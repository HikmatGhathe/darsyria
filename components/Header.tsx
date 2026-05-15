import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('Navigation');

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          DarSyria
        </Link>

        <nav className="flex items-center gap-6">
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

        <LanguageSwitcher />
      </div>
    </header>
  );
}
