'use client';

import {useState, useEffect} from 'react';
import {useParams} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import Link from 'next/link';
import {useAuth} from '@/components/AuthProvider';
import PropertyCard from '@/components/PropertyCard';
import {getSeller, followSeller, unfollowSeller, type SellerProfile} from '@/lib/sellers';
import {formatListedDate} from '@/lib/property-display';

export default function SellerProfilePage() {
  const t = useTranslations('Sellers');
  const tProperty = useTranslations('PropertyDisplay');
  const tAccount = useTranslations('Account');
  const locale = useLocale();
  const params = useParams();
  const id = params.id as string;
  const {user, isLoading: authLoading} = useAuth();

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await getSeller(id);
        if (!cancelled) setSeller(data);
      } catch (e) {
        console.error('Load seller failed:', e);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleFollowToggle() {
    if (!seller || followBusy) return;
    setFollowBusy(true);
    const wasFollowing = seller.is_following;
    try {
      if (wasFollowing) {
        await unfollowSeller(seller.id);
      } else {
        await followSeller(seller.id);
      }
      setSeller((prev) =>
        prev
          ? {
              ...prev,
              is_following: !wasFollowing,
              follower_count: prev.follower_count + (wasFollowing ? -1 : 1)
            }
          : prev
      );
    } catch (e) {
      console.error('Follow toggle failed:', e);
    } finally {
      setFollowBusy(false);
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-text-secondary">Loading...</div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">{t('profileNotFoundTitle')}</h1>
        <p className="text-text-secondary mb-6">{t('profileNotFoundMessage')}</p>
        <Link href={`/${locale}/properties`} className="text-brand-navy hover:underline">
          ← {tProperty('backToListings')}
        </Link>
      </div>
    );
  }

  const isCompany = seller.account_type === 'company';
  const isVerified = seller.verification_status === 'verified';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        href={`/${locale}/properties`}
        className="text-sm text-text-tertiary hover:text-text-primary mb-3 inline-block"
      >
        ← {tProperty('backToListings')}
      </Link>

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-text-primary">
            {seller.display_name ?? t('unknownSeller')}
          </h1>
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('verifiedSeller')}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-4">
          {isCompany ? tAccount('accountTypeCompany') : tAccount('accountTypeIndividual')}
          {' · '}
          {t('memberSince', {date: formatListedDate(seller.member_since, locale)})}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-text-secondary">
            {t('activeListings', {count: seller.active_listing_count})}
          </span>
          <span className="text-sm text-text-secondary">
            {t('followers', {count: seller.follower_count})}
          </span>

          {!seller.is_self && (
            authLoading ? null : !user ? (
              <Link
                href={`/${locale}/login`}
                className="px-4 py-1.5 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover transition-colors"
              >
                {t('followSignedOut')}
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followBusy}
                className={
                  seller.is_following
                    ? 'px-4 py-1.5 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:opacity-50 transition-colors'
                    : 'px-4 py-1.5 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 transition-colors'
                }
              >
                {seller.is_following ? t('following') : t('follow')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Company contact info — shown plainly, no consent gate, since a
          business wants to be found. Individuals never expose phone/address
          here; that stays behind the mutual-consent reveal in conversations. */}
      {isCompany && (seller.company_address || seller.phone || seller.company_website || seller.company_about) && (
        <section className="mb-8 p-5 bg-surface-card border border-border-subtle rounded-xl">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {t('companyInfoHeading')}
          </h2>
          <dl className="space-y-2 text-sm">
            {seller.company_address && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{tAccount('companyAddress')}:</dt>
                <dd className="text-text-primary whitespace-pre-wrap">{seller.company_address}</dd>
              </div>
            )}
            {seller.phone && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{tAccount('phone')}:</dt>
                <dd className="text-text-primary" dir="ltr">{seller.phone}</dd>
              </div>
            )}
            {seller.company_website && (
              <div className="flex gap-2">
                <dt className="text-text-tertiary shrink-0">{t('website')}:</dt>
                <dd className="text-text-primary">
                  <a
                    href={seller.company_website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-brand-navy hover:underline break-all"
                  >
                    {seller.company_website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {seller.company_about && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-1">
                {t('aboutHeading')}
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{seller.company_about}</p>
            </div>
          )}
        </section>
      )}

      {/* Listings */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">{t('listingsHeading')}</h2>
        {seller.listings.length === 0 ? (
          <div className="text-center py-12 px-6 bg-surface-card border border-border-subtle rounded-xl text-text-secondary">
            {t('noListings')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seller.listings.map((p) => (
              <PropertyCard key={p.id} property={p} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
