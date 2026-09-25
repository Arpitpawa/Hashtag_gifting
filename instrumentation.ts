import * as Sentry from "@sentry/nextjs";

// Next.js calls this once, on boot, before anything else runs — it's the
// only supported place to conditionally load a Node-only vs Edge-only
// config file, since importing sentry.server.config.ts directly from a
// normal module would break edge/middleware builds (they don't have
// Node's APIs available).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Lets Sentry capture errors thrown inside Server Components / Server
// Actions / Route Handlers that Next.js itself catches before they'd ever
// reach error.tsx or global-error.tsx — without this hook those errors are
// invisible to Sentry entirely, not just uncaptured client-side.
export const onRequestError = Sentry.captureRequestError;
