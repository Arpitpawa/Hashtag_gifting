"use client";

import { useState } from "react";

export default function NewsletterForm({ buttonClass, inputClass, className }: { buttonClass: string; inputClass: string; className: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading"); setMsg("");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setState("error"); setMsg(data.error || "Something went wrong. Please try again."); return; }
      setState("done"); setEmail("");
    } catch { setState("error"); setMsg("Network error. Please try again."); }
  }

  if (state === "done") return <p className="text-white text-[14px] font-medium">Thanks for subscribing! 🎁</p>;

  return (
    <form onSubmit={submit} className="w-full md:w-auto">
      <div className={className}>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email…" aria-label="Email address" className={inputClass} />
        <button type="submit" disabled={state === "loading"} className={buttonClass + " disabled:opacity-60"}>
          {state === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {state === "error" && <p className="text-white/90 text-[12px] mt-2" role="alert">{msg}</p>}
    </form>
  );
}
