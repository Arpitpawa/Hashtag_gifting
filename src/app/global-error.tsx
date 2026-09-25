"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // This is the last line of defense — any render error that escapes every
  // nested error boundary ends up here. Reporting it is what actually makes
  // error monitoring useful instead of just a nicer-looking crash screen: a
  // no-op if SENTRY DSN isn't configured yet, so this is safe to ship ahead
  // of Arpit setting up the Sentry account.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "20vh 24px", background: "#f3efe8", color: "#1a1a1a" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>Please try again in a moment.</p>
        <button onClick={() => reset()} style={{ padding: "12px 24px", borderRadius: 999, background: "#c0555a", color: "#fff", border: 0, fontWeight: 600, cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
