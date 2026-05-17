import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
            {t('hero.tagline')}
          </p>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/properties"
              className="px-7 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t('hero.ctaPrimary')}
            </Link>
            <Link
              href="/assistant"
              className="px-7 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('pillars.heading')}</h2>
            <p className="text-lg text-gray-600">{t('pillars.subheading')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              icon="🏠"
              title={t('pillars.properties.title')}
              description={t('pillars.properties.description')}
              cta={t('pillars.properties.cta')}
              href="/properties"
            />
            <PillarCard
              icon="📚"
              title={t('pillars.knowledge.title')}
              description={t('pillars.knowledge.description')}
              cta={t('pillars.knowledge.cta')}
              href="/knowledge"
            />
            <PillarCard
              icon="💬"
              title={t('pillars.ai.title')}
              description={t('pillars.ai.description')}
              cta={t('pillars.ai.cta')}
              href="/assistant"
            />
          </div>
        </div>
      </section>

      {/* Trust / honesty section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">{t('trust.heading')}</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">{t('trust.description')}</p>
          <Link
            href="/knowledge/property-fraud-risks"
            className="inline-block px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-100 transition font-medium"
          >
            {t('trust.cta')}
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('footerCta.heading')}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('footerCta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/properties"
              className="px-7 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t('footerCta.ctaPrimary')}
            </Link>
            <Link
              href="/assistant"
              className="px-7 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {t('footerCta.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function PillarCard({
  icon,
  title,
  description,
  cta,
  href
}: {
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="p-8 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition flex flex-col">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-6 flex-1">{description}</p>
      <Link href={href} className="text-blue-600 font-medium hover:underline text-sm">
        {cta} →
      </Link>
    </div>
  );
}
