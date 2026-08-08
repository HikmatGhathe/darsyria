import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import PropertyCard from '@/components/PropertyCard';
import {listPropertiesServer} from '@/lib/server-api';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations('HomePage');

  // Newest published listings — shown right at the top so the platform opens
  // straight onto real properties (no marketing hero to scroll past).
  const latest = await listPropertiesServer({limit: 9, offset: 0, sort: 'newest'});

  return (
    <>
      {/* Listings first */}
      <section className="py-10 md:py-12 bg-surface-page">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-1">
                {t('latest.heading')}
              </h1>
              <p className="text-text-secondary">{t('latest.subheading')}</p>
            </div>
            <Link
              href="/properties"
              className="px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium text-sm whitespace-nowrap"
            >
              {t('latest.viewAll')} →
            </Link>
          </div>

          {latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latest.map((p) => (
                <PropertyCard key={p.id} property={p} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-surface-card border border-border-subtle rounded-xl">
              <p className="text-text-secondary mb-4">{t('latest.empty')}</p>
              <Link
                href="/properties/new"
                className="inline-block px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium"
              >
                {t('pillars.properties.cta')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-20 bg-surface-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-text-primary">{t('pillars.heading')}</h2>
            <p className="text-lg text-text-secondary">{t('pillars.subheading')}</p>
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
      <section className="py-20 bg-surface-page">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-5 text-text-primary">{t('trust.heading')}</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8">{t('trust.description')}</p>
          <Link
            href="/knowledge/property-fraud-risks"
            className="inline-block px-6 py-3 border border-border-subtle bg-surface-card text-text-primary rounded-lg hover:bg-surface-page transition-colors font-medium"
          >
            {t('trust.cta')}
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-surface-card">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-text-primary">{t('footerCta.heading')}</h2>
          <p className="text-lg text-text-secondary mb-8">{t('footerCta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/properties"
              className="px-7 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-hover transition-colors font-medium"
            >
              {t('footerCta.ctaPrimary')}
            </Link>
            <Link
              href="/assistant"
              className="px-7 py-3 border border-border-subtle text-text-primary rounded-lg hover:bg-surface-page transition-colors font-medium"
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
    <div className="p-8 bg-surface-card border border-border-subtle rounded-xl hover:border-border-strong transition flex flex-col">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed mb-6 flex-1">{description}</p>
      <Link href={href} className="text-brand-navy font-medium hover:underline text-sm">
        {cta} →
      </Link>
    </div>
  );
}
