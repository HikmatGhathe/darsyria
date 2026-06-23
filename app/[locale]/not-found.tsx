import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="text-7xl font-semibold text-border-strong mb-4">404</p>
      <h1 className="text-3xl font-semibold mb-3 text-text-primary">{t('title')}</h1>
      <p className="text-text-secondary mb-8">{t('description')}</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
