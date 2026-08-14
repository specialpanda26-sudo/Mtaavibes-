"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { normalizeKenyanPhone, toE164 } from "@/lib/constants";
import GlassCard from "./GlassCard";

const OTP_LEN = 6; // Supabase's default phone OTP token length

// Real phone verification, replacing the old "TODO: wire to real OTP flow"
// bare input on My Tickets. Uses Supabase's built-in phone auth
// (signInWithOtp / verifyOtp) rather than inventing a fake code, so it
// actually sends a real SMS once Phone Auth + an SMS provider (Twilio,
// MessageBird, Vonage) is turned on in the Supabase dashboard — see the
// note this component renders if that isn't configured yet.
//
// Visual language borrowed from the otp-verification.html mockup (boxed
// digits, animated trace-in per box) but re-themed to the site's light
// glass / ink / gold palette instead of the dark neon original.
export default function PhoneVerify({ onVerified }) {
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("phone"); // phone | code | verifying | error
  const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(e) {
    e?.preventDefault();
    setError("");
    const normalized = normalizeKenyanPhone(phone);
    if (!normalized) {
      setError("Enter a valid Safaricom/Airtel number, e.g. 0712 345 678");
      return;
    }
    setSending(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: toE164(normalized),
    });
    setSending(false);
    if (otpError) {
      // Most common cause in a fresh Supabase project: Phone Auth / SMS
      // provider isn't turned on yet in Authentication → Providers.
      setError(
        otpError.message?.includes("provider")
          ? "SMS sign-in isn't turned on yet for this project — enable Phone Auth + an SMS provider in the Supabase dashboard."
          : otpError.message
      );
      return;
    }
    setStage("code");
    setCooldown(30);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function handleDigitChange(i, raw) {
    const v = raw.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;
    const next = Array(OTP_LEN).fill("");
    text.split("").forEach((ch, idx) => (next[idx] = ch));
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  }

  const code = digits.join("");
  const ready = code.length === OTP_LEN;

  useEffect(() => {
    if (ready) verifyCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function verifyCode() {
    setStage("verifying");
    setError("");
    const normalized = normalizeKenyanPhone(phone);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(normalized),
      token: code,
      type: "sms",
    });
    if (verifyError || !data?.session) {
      setError("Incorrect code — try again.");
      setDigits(Array(OTP_LEN).fill(""));
      setStage("code");
      inputRefs.current[0]?.focus();
      return;
    }
    // Keep the same localStorage key the rest of the app already reads
    // (cache invalidation, "switch number"), on top of the real session.
    if (typeof window !== "undefined") localStorage.setItem("buyerPhone", normalized);
    onVerified?.(normalized);
  }

  return (
    <GlassCard className="p-6 max-w-[380px] mx-auto text-center">
      <AnimatePresence mode="wait">
        {stage === "phone" && (
          <motion.form
            key="phone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={sendCode}
          >
            <h2 className="text-[16px] font-medium mb-1">Verify your number</h2>
            <p className="text-[13px] text-tertiary mb-5">
              Enter the phone number you used at checkout — we'll text you a code.
            </p>
            <input
              type="tel"
              autoFocus
              placeholder="0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full glass rounded-2xl px-4 py-3 text-[15px] text-center mb-3 outline-none"
            />
            {error && <p className="text-[12px] text-accentRed mb-3">{error}</p>}
            <button
              disabled={sending}
              className="w-full rounded-button bg-ink py-3 text-[14px] font-medium text-white disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send code"}
            </button>
          </motion.form>
        )}

        {(stage === "code" || stage === "verifying") && (
          <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-[16px] font-medium mb-1">Enter the code</h2>
            <p className="text-[13px] text-tertiary mb-5">
              Sent to <b className="text-ink font-medium">{phone}</b>
            </p>

            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <div key={i} className="relative h-14 w-10">
                  <svg viewBox="0 0 40 56" className="absolute inset-0 h-full w-full overflow-visible">
                    <rect
                      x="1.5"
                      y="1.5"
                      width="37"
                      height="53"
                      rx="10"
                      fill="rgba(0,0,0,0.02)"
                      stroke={error ? "#dc2626" : "rgba(0,0,0,0.12)"}
                      strokeWidth="1.5"
                    />
                    {d && (
                      <motion.rect
                        x="1.5"
                        y="1.5"
                        width="37"
                        height="53"
                        rx="10"
                        fill="none"
                        stroke="#d4af37"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                      />
                    )}
                  </svg>
                  <input
                    ref={(el) => (inputRefs.current[i] = el)}
                    inputMode="numeric"
                    maxLength={1}
                    autoComplete="off"
                    value={d}
                    disabled={stage === "verifying"}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="relative z-10 h-full w-full bg-transparent text-center text-[20px] font-medium outline-none"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-[12px] text-accentRed mb-3">{error}</p>}
            {stage === "verifying" && !error && (
              <p className="text-[12px] text-tertiary mb-3">Verifying…</p>
            )}

            <button
              type="button"
              disabled={cooldown > 0 || sending}
              onClick={sendCode}
              className="text-[12px] font-medium text-secondary underline disabled:opacity-40"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setStage("phone");
                  setDigits(Array(OTP_LEN).fill(""));
                  setError("");
                }}
                className="text-[12px] text-tertiary"
              >
                Use a different number
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
