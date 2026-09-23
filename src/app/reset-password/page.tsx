"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router        = useRouter();
  const token          = searchParams.get("token");

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword]  = useState("");
  const [showPass,        setShowPass]         = useState(false);
  const [loading,         setLoading]          = useState(false);
  const [error,           setError]            = useState("");
  const [done,            setDone]             = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <span className="text-[36px] font-bold tracking-[-1.5px] text-[#1a1a1a]">
              Hashtag
            </span>
            <span className="text-[9px] font-semibold tracking-[5px] text-[#c0555a] uppercase -mt-1">
              gifting
            </span>
          </Link>
          <p className="text-[14px] text-[#6b6b6b] mt-3">
            Reset your password
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e0d5] p-8">

          {!token ? (
            // No token in the URL at all — invalid entry point
            <div className="text-center py-4">
              <XCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Invalid reset link</h2>
              <p className="text-[13px] text-[#6b6b6b] mb-6">
                This link is missing its reset token. Please request a new password reset email.
              </p>
              <Link href="/forgot-password"
                className="inline-block px-6 py-3 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-colors">
                Request new link
              </Link>
            </div>
          ) : done ? (
            // Success
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Password reset!</h2>
              <p className="text-[13px] text-[#6b6b6b]">
                Taking you to login...
              </p>
            </div>
          ) : (
            // The actual form
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <p className="text-[13px] text-[#6b6b6b] -mt-1">
                Choose a new password for your account.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full border-2 border-[#e8e0d5] rounded-xl px-4 py-3.5 pr-12 text-[14px] outline-none focus:border-[#c0555a] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                  Confirm new password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full border-2 border-[#e8e0d5] rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-[#c0555a] transition-colors"
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Resetting...</>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}

          {!done && (
            <p className="text-center text-[13px] text-[#6b6b6b] mt-6">
              Remembered it?{" "}
              <Link href="/login" className="text-[#c0555a] font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3efe8]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}