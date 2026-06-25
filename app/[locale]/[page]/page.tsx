import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {getAllStaticPageSlugs, getStaticPage} from '@/lib/staticPages';
import {SITE_URL} from '@/lib/site';

type Props = {
  params: Promise<{locale: 'ar' | 'de' | 'en'; page: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, page} = await params;
  const content = getStaticPage(page);
  if (!content) return {};
  const description = content.body[locale].replace(/\s+/g, ' ').trim().slice(0, 155);
  return {
    title: content.title[locale],
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/${page}`,
      languages: {
        en: `${SITE_URL}/en/${page}`,
        de: `${SITE_URL}/de/${page}`,
        ar: `${SITE_URL}/ar/${page}`
      }
    }
  };
}

export default async function StaticPage({params}: Props) {
  const {page} = await params;
  const locale = (await getLocale()) as 'ar' | 'de' | 'en';
  const content = getStaticPage(page);

  if (!content) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-semibold mb-8 text-text-primary">{content.title[locale]}</h1>
      <div className="prose prose-lg max-w-none text-text-primary leading-relaxed whitespace-pre-wrap">
        {content.body[locale]}
      </div>
    </article>
  );
}

export function generateStaticParams() {
  return getAllStaticPageSlugs().map((page) => ({page}));
}
