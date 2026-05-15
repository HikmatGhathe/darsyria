import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {getAllStaticPageSlugs, getStaticPage} from '@/lib/staticPages';

type Props = {
  params: Promise<{locale: 'ar' | 'de' | 'en'; page: string}>;
};

export default async function StaticPage({params}: Props) {
  const {page} = await params;
  const locale = (await getLocale()) as 'ar' | 'de' | 'en';
  const content = getStaticPage(page);

  if (!content) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">{content.title[locale]}</h1>
      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
        {content.body[locale]}
      </div>
    </article>
  );
}

export function generateStaticParams() {
  return getAllStaticPageSlugs().map((page) => ({page}));
}
