"use client";

import { useMemo, useState } from "react";
import PaymentButton from "./PaymentButton";
import { pointsToKsh } from "@/lib/constants";

const METHODS = [
  { value: "M-PESA", label: "M-Pesa" },
  { value: "CARD-PAYMENT", label: "Card" },
  { value: "BANK-PAYMENT", label: "Bank" },
];

// event: { id, title, poster_url, tiers: [{ id, tier_name, price, description }] }
// pointsBalance: number (0 if the buyer has none yet — redemption row hides itself)
// referralCode: string | null, read from ?ref= on the page that opened this sheet
export default function PurchaseSheet({ event, pointsBalance = 0, referralCode = null, onClose, onSubmit }) {
  const [tierId, setTierId] = useState(event.tiers?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0];
  const subtotal = (tier?.price ?? 0) * quantity;
  const pointsDiscount = redeemPoints ? Math.min(pointsToKsh(pointsBalance), subtotal) : 0;
  const total = Math.max(subtotal - pointsDiscount, 0);

  const canRedeem = pointsBalance > 0;
  const canPay = method === "M-PESA" ? !!phone : !!email;

  async function handlePay() {
    const result = await onSubmit?.({
      eventId: event.id,
      tierId,
      quantity,
      amount: total,
      method,
      phoneNumber: phone || undefined,
      email: email || undefined,
      referralCode,
      pointsRedeemed: redeemPoints ? Math.min(pointsBalance, subtotal * 2) : 0,
    });
    // Card/Bank return a hosted checkout URL — send the buyer there to finish paying.
    if (result?.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="ticket-perforation glass w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[28px] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-medium">{event.title}</h2>
          <button
            onClick={onClose}
            className="glass h-8 w-8 rounded-full text-secondary"
          >
            ×
          </button>
        </div>

        {event.poster_url && (
          <div
            className="h-[140px] w-full rounded-2xl mb-5 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.poster_url})` }}
          />
        )}

        <p className="text-[14px] font-medium mb-2">Select ticket tier</p>
        <div className="flex gap-2 mb-5">
          {event.tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => setTierId(t.id)}
              className={[
                "flex-1 rounded-2xl border p-3 text-left transition-colors",
                t.id === tierId
                  ? "bg-ink text-white border-ink"
                  : "glass border-white/60 text-secondary",
              ].join(" ")}
            >
              <p className="text-[13px] font-medium capitalize">{t.tier_name}</p>
              <p className="text-[16px] font-medium">KSh {t.price}</p>
              <p className="text-[11px] opacity-70">{t.description}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[14px] font-medium">Number of tickets</p>
            <p className="text-[12px] text-tertiary capitalize">{tier?.tier_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="glass h-9 w-9 rounded-[12px] text-[18px] font-medium"
            >
              −
            </button>
            <span className="text-[18px] font-medium w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="glass h-9 w-9 rounded-[12px] text-[18px] font-medium"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-[14px] font-medium mb-2">Pay with</p>
        <div className="flex gap-2 mb-4">
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={[
                "flex-1 rounded-2xl border px-3 py-2 text-[13px] font-medium transition-colors",
                m.value === method
                  ? "bg-ink text-white border-ink"
                  : "glass border-white/60 text-secondary",
              ].join(" ")}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === "M-PESA" ? (
          <input
            type="tel"
            placeholder="M-Pesa phone number (07XX XXX XXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-5 outline-none"
          />
        ) : (
          <input
            type="email"
            placeholder="Email (for your receipt + checkout link)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-5 outline-none"
          />
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-medium">Total</span>
          <span className="text-[24px] font-medium">KSh {total.toLocaleString()}</span>
        </div>

        {canRedeem && (
          <label className="flex items-center justify-between glass rounded-2xl px-4 py-3 mb-5 cursor-pointer">
            <span className="flex items-center gap-2 text-[13px] font-medium">
              <input
                type="checkbox"
                checked={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.checked)}
              />
              Use my points
            </span>
            <span className="text-[12px] text-tertiary">
              {pointsBalance} pts ≈ KSh {pointsToKsh(pointsBalance)} off
            </span>
          </label>
        )}

        <PaymentButton amount={total} method={method} onPay={handlePay} disabled={!canPay} />
      </div>
    </div>
  );
}
