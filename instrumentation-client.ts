import * as Sentry from "@sentry/nextjs";

// Runs once in the browser, before the app hydrates. This is what catches
// errors that happen on the customer's device — a broken checkout button,
// a crash a specific phone/browser combo hits that never shows up in
// testing — the whole reason this exists instead of only server-side
// monitoring. Same no-op-with-no-DSN safety as the server config.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  debug: false,

  // Session Replay and the feedback widget are deliberately left off for
  // now — both eat into Sentry's free-tier quota fast (replay especially,
  // it's priced per session) and aren't needed to get real value out of
  // this: error + stack trace capture is the actual "find out before a
  // customer complains" win. Easy to turn on later if the free tier has
  // headroom (Sentry.replayIntegration() / Sentry.feedbackIntegration()).
});

// Reports a client-side navigation itself as a transaction, so a route
// that hangs or errors mid-navigation shows up, not just render errors.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
