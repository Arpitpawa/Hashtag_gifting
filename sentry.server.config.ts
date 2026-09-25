import * as Sentry from "@sentry/nextjs";

// Runs once when the Node.js server starts (registered from instrumentation.ts
// below — Next.js requires that indirection, it won't pick this file up on
// its own). Safe to ship with no DSN set yet: Sentry.init() with an empty
// dsn is a documented no-op, so this does nothing until
// NEXT_PUBLIC_SENTRY_DSN is set in the environment (see go-live checklist).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% of transactions get full performance tracing in production, 100%
  // in dev. This is about request/DB timing data, not error capture —
  // errors are always captured regardless of this number. Free-tier Sentry
  // plans cap monthly transaction volume, so keeping this low in prod
  // avoids burning through that quota just from ordinary traffic.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Quiet in normal operation; only chatty if you set SENTRY_DEBUG=true.
  debug: false,
});
