"use client";

import { useState } from "react";
import RippleButton from "./RippleButton";
import ConfettiBurst from "./ConfettiBurst";

const LABELS = {
  "M-PESA": "M-Pesa",
  "CARD-PAYMENT": "Card",
  "BANK-PAYMENT": "Bank",
};

// Buyer-facing button. Says "M-Pesa" / "Card" / "Bank" because those are the
// actual payment methods. The processor behind them (IntaSend) is never
// named — only "Ogolla Pay".
export default function PaymentButton({ amount, method = "M-PESA", onPay, disabled = false }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [celebrate, setCelebrate] = useState(false);
  const label = LABELS[method] ?? method;

  async function handleClick() {
    if (disabled || status !== "idle") return;
    setStatus("sending");
    try {
      await onPay?.();
      setStatus("sent");
      // Card/Bank redirect away immediately, so the confetti mostly shows on
      // the M-Pesa path — that's fine, it's the common case.
      setCelebrate(true);
      setTimeout(() => {
        setStatus("idle");
        setCelebrate(false);
      }, 2000);
    } catch (err) {
      console.error("Payment failed:", err);
      setStatus("idle");
    }
  }

  const sendingText = method === "M-PESA" ? "Sending STK push…" : "Redirecting to secure checkout…";
  const sentText = method === "M-PESA" ? "✓ STK push sent!" : "✓ Redirecting…";

  return (
    <div className="text-center">
      <ConfettiBurst trigger={celebrate} />
      <RippleButton
        onClick={handleClick}
        disabled={disabled || status !== "idle"}
        tone="dark"
        className={[
          "w-full rounded-button py-4 text-[16px] font-medium text-white shadow-soft transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-softLg active:scale-[0.97]",
          status === "sent" ? "bg-accentGreen" : "bg-ink",
          disabled ? "opacity-50" : "",
        ].join(" ")}
      >
        {status === "idle" && `Pay KSh ${amount?.toLocaleString?.() ?? amount} with ${label}`}
        {status === "sending" && sendingText}
        {status === "sent" && sentText}
      </RippleButton>
      <p className="mt-2 text-[11px] text-tertiary">Secured by Ogolla Pay</p>
    </div>
  );
}
