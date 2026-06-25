// Sentry init for the browser. Next.js loads this automatically on the client.
// No-op unless NEXT_PUBLIC_SENTRY_DSN is set.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate:
      Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0') || 0,
    // Session Replay is off by default; opt in later if wanted.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0
  });
}

// Lets Sentry tie client-side navigation spans together.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
