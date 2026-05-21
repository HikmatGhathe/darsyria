export function formatPrice(
  amount: string | number,
  currency: string,
  locale: string
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';

  const formatter = new Intl.NumberFormat(
    locale === 'ar' ? 'ar' : locale === 'de' ? 'de-DE' : 'en-US',
    {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }
  );

  try {
    return formatter.format(num);
  } catch {
    return `${num.toLocaleString()} ${currency}`;
  }
}

export function propertyTypeKey(type: string): string {
  const map: Record<string, string> = {
    apartment: 'typeApartment',
    house: 'typeHouse',
    land: 'typeLand',
    commercial: 'typeCommercial'
  };
  return map[type] || type;
}

export function documentStatusInfo(status: string): {
  key: string;
  color: 'gray' | 'amber' | 'blue';
} {
  switch (status) {
    case 'documents_provided':
      return {key: 'docBadgeProvided', color: 'blue'};
    case 'claimed':
      return {key: 'docBadgeClaimed', color: 'amber'};
    default:
      return {key: 'docBadgeNone', color: 'gray'};
  }
}

export function formatLocation(
  city: string,
  neighborhood: string | null,
  locale: string
): string {
  if (!neighborhood) return city;
  return `${neighborhood}, ${city}`;
}

export function formatListedDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  const formatter = new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar' : locale === 'de' ? 'de-DE' : 'en-US',
    {year: 'numeric', month: 'short', day: 'numeric'}
  );
  return formatter.format(date);
}
