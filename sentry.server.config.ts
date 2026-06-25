// Sentry init for the Node.js server runtime. Loaded from instrumentation.ts.
// No-op unless NEXT_PUBLIC_SENTRY_DSN is set, so local/CI builds are unaffected.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0') || 0,
    // We handle auth cookies + user PII; don't ship request data by default.
    sendDefaultPii: false
  });
}
