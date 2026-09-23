"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "phone" | "otp" | "success";

interface Props {
  callbackUrl?: string;
}

export default function PhoneOtpLogin({ callbackUrl = "/" }: Props) {
  const router   = useRouter();
  const [step, setStep]         = useState<Step>("phone");
  const [phone, setPhone]       = useState("");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [timer, setTimer]       = useState(0);
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // ── COUNTDOWN TIMER ──
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ── SEND OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
      setTimer(60); // 60 second resend cooldown

      // Focus first OTP input
      setTimeout(() => otpRefs[0].current?.focus(), 100);

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── HANDLE OTP INPUT ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (newOtp.every((d) => d !== "") && value) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      handleVerifyOtp(pasted);
    }
  };

  // ── VERIFY OTP + SIGN IN ──
  const handleVerifyOtp = async (otpString?: string) => {
    const otpValue = otpString || otp.join("");
    if (otpValue.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn("phone-otp", {
        phone,
        otp:       otpValue,
        redirect:  false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
        // Reset OTP inputs on error
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs[0].current?.focus(), 100);
        return;
      }

      setStep("success");
      setTimeout(() => router.push(callbackUrl), 1000);

    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND OTP ──
  const handleResend = async () => {
    if (timer > 0) return;
    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);

    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ──
  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-[16px] font-bold text-[#1a1a1a]">Logged in successfully!</h3>
        <p className="text-[13px] text-[#6b6b6b]">Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── STEP 1: PHONE INPUT ── */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-semibold text-[#555] uppercase tracking-wider block mb-2">
              Mobile number
            </label>
            <div className="flex items-center gap-0 border-2 border-[#e8e0d5] rounded-xl overflow-hidden focus-within:border-[#c0555a] transition-colors">
              {/* Country code */}
              <div className="flex items-center gap-2 px-4 py-3.5 bg-[#f3efe8] border-r border-[#e8e0d5]">
                <span className="text-[14px]">🇮🇳</span>
                <span className="text-[14px] font-medium text-[#555]">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 px-4 py-3.5 text-[14px] outline-none bg-white text-[#1a1a1a] placeholder:text-[#ccc]"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
            ) : (
              <><Phone size={16} /> Send OTP</>
            )}
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP INPUT ── */}
      {step === "otp" && (
        <div className="flex flex-col gap-5">

          {/* BACK BUTTON */}
          <button
            onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
            className="flex items-center gap-2 text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors w-fit"
          >
            <ArrowLeft size={14} /> Change number
          </button>

          <div>
            <p className="text-[14px] text-[#1a1a1a] mb-1">
              OTP sent to <span className="font-semibold">+91 {phone}</span>
            </p>
            <p className="text-[12px] text-[#aaa]">
              Enter the 6-digit code below
            </p>
          </div>

          {/* OTP BOXES */}
          <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`w-12 h-14 text-center text-[20px] font-bold border-2 rounded-xl outline-none transition-all duration-200 ${
                  digit
                    ? "border-[#c0555a] bg-[#c0555a]/5 text-[#c0555a]"
                    : "border-[#e8e0d5] focus:border-[#c0555a] text-[#1a1a1a]"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* VERIFY BUTTON */}
          <button
            onClick={() => handleVerifyOtp()}
            disabled={loading || otp.some((d) => !d)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#c0555a] text-white text-[14px] font-semibold rounded-full hover:bg-[#a84449] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying...</>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* RESEND */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-[13px] text-[#aaa]">
                Resend OTP in{" "}
                <span className="text-[#c0555a] font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-[13px] text-[#c0555a] font-semibold hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}