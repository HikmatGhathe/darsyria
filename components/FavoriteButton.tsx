'use client';

import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {useAuth} from './AuthProvider';
import {useFavorites} from './FavoritesProvider';

// Heart toggle. Used both as an overlay on PropertyCard (icon only) and as a
// labelled button on the listing detail page. Because the card is a full
// <Link>, the click is stopped from bubbling/navigating.
export default function FavoriteButton({
  propertyId,
  className,
  withLabel = false
}: {
  propertyId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const t = useTranslations('Favorites');
  const router = useRouter();
  const {user} = useAuth();
  const {isFavorited, toggle} = useFavorites();
  const favorited = isFavorited(propertyId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    void toggle(propertyId);
  }

  const label = favorited ? t('remove') : t('add');

  const base = withLabel
    ? 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors'
    : 'inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur transition-colors';

  const state = favorited
    ? 'bg-accent-danger-bg border-accent-danger/40 text-accent-danger'
    : 'bg-surface-card/90 border-border-subtle text-text-secondary hover:text-accent-danger';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={label}
      title={label}
      className={`${base} ${state} ${className ?? ''}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
      {withLabel && <span>{favorited ? t('saved') : t('save')}</span>}
    </button>
  );
}
