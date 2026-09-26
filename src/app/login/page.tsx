"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import PhoneOtpLogin from "@/components/auth/PhoneOtpLogin";

type LoginTab = "email" | "phone";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function LoginForm() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  // Only same-site relative paths — blocks ?callbackUrl=https://evil.com open redirects.
  const rawCallback  = searchParams.get("callbackUrl") || "/";
  const callbackUrl  = rawCallback.startsWith("/") && !rawCallback.startsWith("//") && !rawCallback.startsWith("/\\") ? rawCallback : "/";

  const [tab,         setTab]         = useState<LoginTab>("email");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);
  const [error,       setError]       = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent,      setResent]      = useState(false);

  // Banners coming back from signup / the emailed verification link / a
  // password change on the account page.
  const verified        = searchParams.get("verified");
  const registered      = searchParams.get("registered");
  const passwordChanged = searchParams.get("passwordChanged");
  const notice =
    verified === "1"        ? "Email verified — you can log in now." :
    verified === "invalid"  ? "That verification link is invalid or has expired. Log in to get a new one." :
    registered === "1"      ? "Account created! Check your email and click the verification link, then log in." :
    passwordChanged === "1" ? "Password changed — you've been signed out everywhere, including this device. Log in again with your new password." :
    "";

  const resendVerification = async () => {
    setResent(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  };

  // ── GOOGLE LOGIN ──
  const handleGoogle = async () => {
    setGoogleLoad(true);
    await signIn("google", { callbackUrl });
  };

  // ── EMAIL LOGIN ──
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect:    false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerify(true);
          setError("Please verify your email first — we sent you a link when you signed up.");
          return;
        }
        setNeedsVerify(false);
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();

    } catch {
      setError("Login failed. Please try again.");
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
            Login to your account
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e0d5] p-8">

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogle}
            disabled={googleLoad}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] font-medium text-[#1a1a1a] hover:border-[#c0555a] hover:bg-[#c0555a]/5 transition-all duration-300 disabled:opacity-50 mb-5"
          >
            {googleLoad ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-[#e8e0d5]" />
            <span className="text-[12px] text-[#aaa] font-medium">or</span>
            <div className="flex-1 h-px bg-[#e8e0d5]" />
          </div>

          {/* TABS */}
          <div className="flex gap-1 p-1 bg-[#f3efe8] rounded-xl mb-6">
            <button
              onClick={() => { setTab("email"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                tab === "email"
                  ? "bg-white text-[#c0555a] shadow-sm"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >
              Email & password
            </button>
            <button
              onClick={() => { setTab("phone"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                tab === "phone"
                  ? "bg-white text-[#c0555a] shadow-sm"
                  : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* EMAIL TAB */}
          {tab === "email" && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="border-2 border-[#e8e0d5] rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-[#c0555a] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[12px] text-[#c0555a] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              {notice && !error && (
                <p className="text-[13px] text-green-700 bg-green-50 px-4 py-3 rounded-xl">
                  {notice}
                </p>
              )}

              {error && (
                <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                  {error}
                  {needsVerify && (
                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={resent}
                      className="block mt-2 font-semibold underline disabled:no-underline disabled:opacity-60"
                    >
                      {resent ? "Verification link sent — check your inbox" : "Resend verification email"}
                    </button>
                  )}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Logging in...</>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* PHONE OTP TAB */}
          {tab === "phone" && (
            <PhoneOtpLogin callbackUrl={callbackUrl} />
          )}

          {/* SIGNUP LINK */}
          <p className="text-center text-[13px] text-[#6b6b6b] mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#c0555a] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3efe8]" />}>
      <LoginForm />
    </Suspense>
  );
}