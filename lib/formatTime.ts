import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

type Translator = (key: string, values?: Record<string, string | number>) => string;

/**
 * Format a timestamp as a relative time string ("2h ago", "yesterday", etc.).
 * Falls back to an absolute date string for anything older than 6 days.
 *
 * Uses the Inbox.relative* translation keys.
 */
export function formatRelativeTime(
  timestamp: string,
  t: Translator,
  locale: string
): string {
  const date = new Date(timestamp);
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return t('relativeJustNow');
  if (minutes < 60) return t('relativeMinutesAgo', { count: minutes });

  const hours = differenceInHours(now, date);
  if (hours < 24) return t('relativeHoursAgo', { count: hours });

  const days = differenceInDays(now, date);
  if (days === 1) return t('relativeYesterday');
  if (days < 7) return t('relativeDaysAgo', { count: days });

  // Older than 6 days — show absolute date in the user's locale
  const dateStr = date.toLocaleDateString(localeMap(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return t('relativeOlder', { date: dateStr });
}

function localeMap(locale: string): string {
  switch (locale) {
    case 'de': return 'de-DE';
    case 'ar': return 'ar-SY';
    default: return 'en-GB';
  }
}
