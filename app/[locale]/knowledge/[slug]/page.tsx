import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getArticleBySlug, getAllArticles} from '@/lib/articles';

type Props = {
  params: Promise<{locale: 'ar' | 'de' | 'en'; slug: string}>;
};

export default async function ArticlePage({params}: Props) {
  const {locale, slug} = await params;
  const article = getArticleBySlug(slug);
  const t = await getTranslations('KnowledgeBase');

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/knowledge" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← {t('backToList')}
      </Link>

      <header className="mb-8 pb-6 border-b border-gray-200">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">
          {t(`categories.${article.category}`)}
        </span>
        <h1 className="text-4xl font-bold leading-tight mb-4">{article.title[locale]}</h1>
        <p className="text-sm text-gray-500">{article.publishedAt}</p>
      </header>

      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
        <p>{article.body[locale]}</p>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('sources')}</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          {article.sources.map((source, i) => (
            <li key={i}>
              {source.url ? (
                <a href={source.url} className="hover:underline text-blue-600">{source.label}</a>
              ) : (
                source.label
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-gray-500 italic">{t('disclaimer')}</p>
      </footer>
    </article>
  );
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({slug: a.slug}));
}
