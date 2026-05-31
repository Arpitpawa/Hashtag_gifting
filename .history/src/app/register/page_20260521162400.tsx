"use client";

import { useState }            from "react";
import { signIn }              from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link                    from "next/link";
import { Loader2, Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { Suspense } from "react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/";

  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    // Client-side validation
    if (name.trim().length < 2)    { setError("Name must be at least 2 characters"); setLoading(false); return; }
    if (password.length < 6)        { setError("Password must be at least 6 characters"); setLoading(false); return; }
    if (phone && !/^\d{10}$/.test(phone)) { setError("Phone must be 10 digits"); setLoading(false); return; }

    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), password, phone: phone || null }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      // Auto-login after register
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false, callbackUrl });
      if (result?.error) { router.push("/login"); return; }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-[14px] text-[#6b6b6b] mt-3">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e0d5] p-8">

          {/* Google */}
          <button onClick={() => { setGoogleLoad(true); signIn("google", { callbackUrl }); }}
            disabled={googleLoad}
            className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] font-medium text-[#1a1a1a] hover:border-[#c0555a] hover:bg-[#c0555a]/5 transition-all disabled:opacity-50 mb-5">
            {googleLoad ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-[#e8e0d5]" />
            <span className="text-[12px] text-[#aaa] font-medium">or register with email</span>
            <div className="flex-1 h-px bg-[#e8e0d5]" />
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">
                Phone number <span className="text-[#aaa] normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" />
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-12 py-3.5 border-2 border-[#e8e0d5] rounded-xl text-[14px] outline-none focus:border-[#c0555a] transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <p className="text-[12px] text-[#aaa] leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-[#c0555a] hover:underline">Terms</Link>{" "}and{" "}
              <Link href="/privacy" className="text-[#c0555a] hover:underline">Privacy Policy</Link>
            </p>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#c0555a] text-white text-[14px] font-bold rounded-full hover:bg-[#a84449] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#6b6b6b] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c0555a] font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3efe8]" />}>
      <RegisterForm />
    </Suspense>
  );
}