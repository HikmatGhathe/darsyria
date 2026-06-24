import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getArticleBySlug, getAllArticles} from '@/lib/articles';
import {SITE_URL} from '@/lib/site';

type Props = {
  params: Promise<{locale: 'ar' | 'de' | 'en'; slug: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return {title: 'Not found', robots: {index: false}};
  }
  const title = article.title[locale];
  const description = article.excerpt[locale].replace(/\s+/g, ' ').trim().slice(0, 155);
  const url = `${SITE_URL}/${locale}/knowledge/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en/knowledge/${slug}`,
        de: `${SITE_URL}/de/knowledge/${slug}`,
        ar: `${SITE_URL}/ar/knowledge/${slug}`
      }
    },
    openGraph: {type: 'article', url, title, description},
    twitter: {card: 'summary', title, description}
  };
}

export default async function ArticlePage({params}: Props) {
  const {locale, slug} = await params;
  const article = getArticleBySlug(slug);
  const t = await getTranslations('KnowledgeBase');

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/knowledge" className="text-sm text-brand-navy hover:underline mb-6 inline-block">
        ← {t('backToList')}
      </Link>

      <header className="mb-8 pb-6 border-b border-border-subtle">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-navy mb-3">
          {t(`categories.${article.category}`)}
        </span>
        <h1 className="text-4xl font-semibold leading-tight mb-4 text-text-primary">{article.title[locale]}</h1>
        <p className="text-sm text-text-tertiary">{article.publishedAt}</p>
      </header>

      <div className="prose prose-lg max-w-none text-text-primary leading-relaxed">
        <p>{article.body[locale]}</p>
      </div>

      <footer className="mt-12 pt-6 border-t border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('sources')}</h3>
        <ul className="space-y-1 text-sm text-text-secondary">
          {article.sources.map((source, i) => (
            <li key={i}>
              {source.url ? (
                <a href={source.url} className="hover:underline text-brand-navy">{source.label}</a>
              ) : (
                source.label
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-text-tertiary italic">{t('disclaimer')}</p>
      </footer>
    </article>
  );
}

export function generateStaticParams() {
  return getAllArticles().map((a) => ({slug: a.slug}));
}
