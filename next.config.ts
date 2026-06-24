import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

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

export default withNextIntl(nextConfig);
