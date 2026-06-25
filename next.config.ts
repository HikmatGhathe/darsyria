import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {withSentryConfig} from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        // Cloudflare R2 public bucket — property images / OG images
        protocol: 'https',
        hostname: 'pub-f4dee505b01349949d96386fa7c670a0.r2.dev'
      }
    ]
  }
};

// Sentry wraps the config to add error instrumentation and (when an auth token
// + org/project are present at build time) source-map upload. With none of
// those set it's a harmless no-op, so builds work without any Sentry config.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true
});
