import type {MetadataRoute} from 'next';
import {getAllArticles} from '@/lib/articles';
import {routing} from '@/i18n/routing';
import {SITE_URL} from '@/lib/site';

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

// Static, non-localized path segments (each is emitted once per locale).
const STATIC_PATHS = [
  '',
  '/properties',
  '/knowledge',
  '/about',
  '/contact',
  '/impressum',
  '/terms',
  '/privacy',
  '/disclaimer'
];

type SitemapEntry = {id: string; updated_at: string};

async function fetchSitemapData(): Promise<{
  properties: SitemapEntry[];
  sellers: SitemapEntry[];
}> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/sitemap-data`, {cache: 'no-store'});
    if (!res.ok) return {properties: [], sellers: []};
    return await res.json();
  } catch {
    return {properties: [], sellers: []};
  }
}

function languagesFor(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
  );
}

// One <url> per (path, locale), each carrying the full hreflang alternate set.
function entriesForPath(path: string, lastModified?: string | Date): MetadataRoute.Sitemap {
  const languages = languagesFor(path);
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified,
    alternates: {languages}
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {properties, sellers} = await fetchSitemapData();

  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push(...entriesForPath(path));
  }

  for (const article of getAllArticles()) {
    entries.push(...entriesForPath(`/knowledge/${article.slug}`));
  }

  for (const p of properties) {
    entries.push(...entriesForPath(`/properties/${p.id}`, p.updated_at));
  }

  for (const s of sellers) {
    entries.push(...entriesForPath(`/sellers/${s.id}`, s.updated_at));
  }

  return entries;
}
