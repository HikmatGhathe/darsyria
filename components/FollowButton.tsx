'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useAuth} from './AuthProvider';
import {getSeller, followSeller, unfollowSeller} from '@/lib/sellers';

type Props = {
  sellerId: string;
  locale: string;
};

// Self-contained, like ContactSellerButton: given just a seller id, looks
// up whether the current viewer already follows them and renders the
// right state. Used on the property detail page; the seller profile page
// has its own inline version since it already has this data loaded.
export default function FollowButton({sellerId, locale}: Props) {
  const t = useTranslations('Sellers');
  const {user, isLoading: authLoading} = useAuth();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsFollowing(null);
      return;
    }
    getSeller(sellerId)
      .then((profile) => {
        if (!cancelled) setIsFollowing(profile.is_following);
      })
      .catch((e) => {
        console.debug('Could not look up follow state:', e);
        if (!cancelled) setIsFollowing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId, user]);

  async function handleToggle() {
    if (isFollowing === null || busy) return;
    setBusy(true);
    const next = !isFollowing;
    try {
      if (next) {
        await followSeller(sellerId);
      } else {
        await unfollowSeller(sellerId);
      }
      setIsFollowing(next);
    } catch (e) {
      console.error('Follow toggle failed:', e);
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <Link
        href={`/${locale}/login`}
        className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page transition-colors"
      >
        {t('followSignedOut')}
      </Link>
    );
  }

  if (isFollowing === null) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-surface-card border border-border-subtle text-text-tertiary text-sm font-medium rounded-lg cursor-not-allowed"
      >
        ...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={
        isFollowing
          ? 'px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:opacity-50 transition-colors'
          : 'px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-navy-hover disabled:opacity-50 transition-colors'
      }
    >
      {isFollowing ? t('following') : t('follow')}
    </button>
  );
}
