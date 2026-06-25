import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {AuthProvider} from '@/components/AuthProvider';
import {FavoritesProvider} from '@/components/FavoritesProvider';
import CookieNotice from '@/components/CookieNotice';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ThemeInitializer from '@/components/ThemeInitializer';
import {routing} from '@/i18n/routing';
import {SITE_NAME, SITE_URL} from '@/lib/site';

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  de: 'de_DE',
  ar: 'ar_AR'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});
  const title = t('hero.title');
  const description = t('hero.tagline');

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${title} | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`
    },
    description,
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      locale: OG_LOCALES[locale] ?? 'en_US',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ['/og-default.png']
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ['/og-default.png']
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="bg-surface-page text-text-primary flex flex-col min-h-screen">
        <ThemeInitializer />
        <NextIntlClientProvider>
          <AuthProvider>
            <FavoritesProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieNotice />
            </FavoritesProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
