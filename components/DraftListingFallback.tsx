'use client';

import {useState, useEffect} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {getProperty, type Property} from '@/lib/properties';
import PropertyDetailView from '@/components/PropertyDetailView';

// Rendered when the server couldn't see the listing (e.g. an owner viewing
// their own draft with a stale access token). Does the authed client fetch —
// which transparently refreshes the session — and renders the same view, or a
// not-found message if the listing is genuinely gone. Crawlers never reach
// here: the server returns a real 404 for anonymous requests.
export default function DraftListingFallback({id}: {id: string}) {
  const t = useTranslations('PropertyDisplay');
  const locale = useLocale();
  const [property, setProperty] = useState<Property | null>(null);
  const [state, setState] = useState<'loading' | 'found' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    getProperty(id)
      .then((p) => {
        if (!cancelled) {
          setProperty(p);
          setState('found');
        }
      })
      .catch(() => {
        if (!cancelled) setState('notfound');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === 'loading') {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-text-secondary">Loading...</div>;
  }

  if (state === 'notfound' || !property) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">{t('notFoundTitle')}</h1>
        <p className="text-text-secondary mb-6">{t('notFoundMessage')}</p>
        <Link href={`/${locale}/properties`} className="text-brand-navy hover:underline">
          ← {t('backToListings')}
        </Link>
      </div>
    );
  }

  return <PropertyDetailView property={property} />;
}
