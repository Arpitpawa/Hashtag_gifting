"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
