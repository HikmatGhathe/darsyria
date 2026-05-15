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
        <h1 className="text-4xl font-bold mb-3">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </header>

      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/knowledge/${article.slug}`}
            className="block p-6 border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
              {t(`categories.${article.category}`)}
            </span>
            <h2 className="text-xl font-semibold mb-2">{article.title[locale]}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{article.excerpt[locale]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
