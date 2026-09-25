import * as Sentry from "@sentry/nextjs";

// Same as sentry.server.config.ts but for code that runs on the Edge
// runtime (middleware, any edge-runtime route handlers) — Next.js keeps
// these as separate entry points because the edge runtime is a different,
// more restricted JS environment than the Node.js server.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: false,
});
