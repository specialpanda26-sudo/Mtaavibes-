"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RippleButton from "./RippleButton";
import ConfettiBurst from "./ConfettiBurst";

const LABELS = {
  "M-PESA": "M-Pesa",
  "CARD-PAYMENT": "Card",
  "BANK-PAYMENT": "Bank",
};

// Small animated card mockup shown above the button for card payments —
// idle → scanning beam while "sending" → green checkmark morph on success.
function CardPaymentVisual({ status }) {
  return (
    <div className="relative mx-auto mb-5 h-[124px] w-[210px]">
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl p-4 flex flex-col justify-between"
        style={{ background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-5 w-7 rounded-[4px] bg-gradient-to-br from-gold to-gold-light" />
          <span className="text-[9px] font-medium tracking-[2px] text-white/40">OGOLLA PAY</span>
        </div>
        <p className="text-[13px] tracking-[2px] text-white/80">•••• •••• •••• 9901</p>

        {status === "sending" && (
          <motion.div
            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ left: "-48px" }}
            animate={{ left: "210px" }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        )}

        {status === "sent" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="absolute inset-0 flex items-center justify-center bg-accent-green/90"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 12 }}
              className="text-[26px] text-white"
            >
              ✓
            </motion.span>
          </motion.div>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-tertiary">
        {status === "sending" ? "Verifying card…" : status === "sent" ? "Payment successful" : "Card ready"}
      </p>
    </div>
  );
}

export default function PaymentButton({ amount, method = "M-PESA", onPay, disabled = false }) {
  const [status, setStatus] = useState("idle");
  const [celebrate, setCelebrate] = useState(false);
  const label = LABELS[method] ?? method;

  async function handleClick() {
    if (disabled || status !== "idle") return;
    setStatus("sending");
    try {
      await onPay?.();
      setStatus("sent");
      setCelebrate(true);
      setTimeout(() => {
        setStatus("idle");
        setCelebrate(false);
      }, 2200);
    } catch (err) {
      console.error("Payment failed:", err);
      setStatus("idle");
    }
  }

  const sendingText = method === "M-PESA" ? "Sending STK push…" : "Redirecting to secure checkout…";
  const sentText = method === "M-PESA" ? "You're in — ticket secured" : "✓ Redirecting…";

  return (
    <div className="text-center relative">
      <ConfettiBurst trigger={celebrate} />
      {method === "CARD-PAYMENT" && <CardPaymentVisual status={status} />}

      <RippleButton
        onClick={handleClick}
        disabled={disabled || status !== "idle"}
        tone="dark"
        className={[
          "relative w-full overflow-hidden rounded-button py-4 text-[16px] font-medium text-white shadow-soft transition-all duration-300",
          "hover:-translate-y-0.5 hover:shadow-softLg active:scale-[0.97]",
          status === "sent" ? "bg-accentGreen" : "bg-ink",
          disabled ? "opacity-50" : "",
        ].join(" ")}
      >
        {status === "sending" && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.25), transparent 30%)",
              animation: "beamSpin 1.2s linear infinite",
            }}
          />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {status === "sending" && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white animate-pulseDot" />
            </span>
          )}
          {status === "sent" && (
            <span className="inline-block animate-successPop">✓</span>
          )}
          <span>
            {status === "idle" && `Pay KSh ${amount?.toLocaleString?.() ?? amount} with ${label}`}
            {status === "sending" && sendingText}
            {status === "sent" && sentText}
          </span>
        </span>
      </RippleButton>

      {status === "sending" && (
        <p className="mt-2 text-[11px] text-tertiary animate-pulse">
          Confirming your spot on the guest list…
        </p>
      )}
      {status !== "sending" && (
        <p className="mt-2 text-[11px] text-tertiary">Secured by Ogolla Pay</p>
      )}
    </div>
  );
}
