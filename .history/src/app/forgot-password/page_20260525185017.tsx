"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok || data.message) { setSent(true); }
      else setError(data.error || "Something went wrong. Please try again.");
    } catch {
      // Even on error, show success to prevent email enumeration
      setSent(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="text-[36px] font-bold tracking-[-1.5px] text-[#1a1a1a]">Hashtag</span>
            <span className="text-[9px] font-semibold tracking-[5px] text-[#c0555a] uppercase -mt-1">gifting</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e0d5] p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-2">Check your email</h1>
              <p className="text-[14px] text-[#888] leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, we have sent password reset instructions to that email address.
              </p>
              <p className="text-[13px] text-[#aaa] mb-6">
                Did not receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-[#c0555a] hover:underline font-medium">
                  try again
                </button>
              </p>
              <Link href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#c0555a] text-white font-bold rounded-full hover:bg-[#a84449] transition-colors">
                <ArrowLeft size={16} /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1">Forgot your password?</h1>
                <p className="text-[14px] text-[#888]">Enter your email and we will send you reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
                  </div>
                </div>

                {error && <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send reset link"}
                </button>
              </form>

              <p className="text-center text-[13px] text-[#6b6b6b] mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-[#c0555a] font-semibold hover:underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}