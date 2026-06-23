import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {getAllArticles} from '@/lib/articles';

export default function KnowledgePage() {
  const t = useTranslations('KnowledgeBase');
  const locale = useLocale() as 'ar' | 'de' | 'en';
  const articles = getAllArticles();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-semibold mb-3 text-text-primary">{t('title')}</h1>
        <p className="text-lg text-text-secondary">{t('subtitle')}</p>
      </header>

      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/knowledge/${article.slug}`}
            className="block p-6 bg-surface-card border border-border-subtle rounded-xl hover:border-border-strong transition"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-navy mb-2">
              {t(`categories.${article.category}`)}
            </span>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">{article.title[locale]}</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{article.excerpt[locale]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
