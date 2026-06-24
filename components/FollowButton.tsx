'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import {getSeller, followSeller, unfollowSeller} from '@/lib/sellers';

type Props = {
  sellerId: string;
  locale: string;
  // When the parent already knows the follow state (e.g. the server-rendered
  // seller profile), pass it so the button renders correctly with no extra
  // fetch or flash. Omitted on the listing page, where it looks itself up.
  initialFollowing?: boolean;
};

// Self-contained follow toggle. Given a seller id, renders the right state
// for the current viewer and keeps server-rendered data (e.g. follower count)
// in sync via router.refresh() after a successful toggle.
export default function FollowButton({sellerId, locale, initialFollowing}: Props) {
  const t = useTranslations('Sellers');
  const router = useRouter();
  const {user, isLoading: authLoading} = useAuth();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(
    initialFollowing ?? null
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If the parent provided the state, trust it — no lookup needed.
    if (initialFollowing !== undefined) return;
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
  }, [sellerId, user, initialFollowing]);

  async function handleToggle() {
    if (isFollowing === null || busy) return;
    setBusy(true);
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    try {
      if (next) {
        await followSeller(sellerId);
      } else {
        await unfollowSeller(sellerId);
      }
      router.refresh(); // re-sync server-rendered follower count / state
    } catch (e) {
      console.error('Follow toggle failed:', e);
      setIsFollowing(!next); // revert
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) return null;

  // Don't offer "Follow" to a seller on their own listing/profile.
  if (user && user.id === sellerId) return null;

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
