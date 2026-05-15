'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';

const locales = [
  {code: 'en', label: 'English'},
  {code: 'de', label: 'Deutsch'},
  {code: 'ar', label: 'العربية'}
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  }

  return (
    <div className="flex gap-2">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => switchLocale(loc.code)}
          className={`px-3 py-1 text-sm rounded transition ${
            currentLocale === loc.code
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {loc.label}
        </button>
      ))}
    </div>
  );
}
