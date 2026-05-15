import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="text-7xl font-bold text-gray-300 mb-4">404</p>
      <h1 className="text-3xl font-bold mb-3">{t('title')}</h1>
      <p className="text-gray-600 mb-8">{t('description')}</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
