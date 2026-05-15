import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'de', 'en'],
  defaultLocale: 'en',
  localePrefix: 'always'
});
