import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex flex-col items-center justify-center p-8 py-24">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold">{t('title')}</h1>
        <p className="text-2xl text-gray-700">{t('tagline')}</p>
        <p className="text-lg text-gray-600">{t('description')}</p>

        <div className="flex gap-4 justify-center pt-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {t('ctaPrimary')}
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            {t('ctaSecondary')}
          </button>
        </div>
      </div>
    </div>
  );
}
