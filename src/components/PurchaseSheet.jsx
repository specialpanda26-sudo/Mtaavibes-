"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentButton from "./PaymentButton";
import Portal from "./Portal";
import TierBadge from "./TierBadge";
import { pointsToKsh } from "@/lib/constants";

const METHODS = [
  { value: "M-PESA", label: "M-Pesa" },
  { value: "CARD-PAYMENT", label: "Card" },
  { value: "BANK-PAYMENT", label: "Bank" },
];

// Bug fix: the events feed was passing `pointsBalance` and `referralCode`
// props to this component, but PurchaseSheet never declared or read
// either one — so points could never be redeemed at checkout, and a
// referral link's `?ref=` code never actually made it into the payment
// payload. That silently broke the entire referral/points feature
// end-to-end even though the backend (webhook) fully supports it.
export default function PurchaseSheet({ event, onClose, onSubmit, pointsBalance = 0, referralCode = null }) {
  const [tierId, setTierId] = useState(event.tiers?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState("M-PESA");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(false);

  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0];
  const subtotal = (tier?.price ?? 0) * quantity;
  // Never let a points redemption take the total below KSh 1 (stkpush
  // clamps this server-side too, but mirroring it here keeps the number
  // shown to the buyer honest).
  const maxRedeemablePoints = Math.min(pointsBalance, (subtotal - 1) * 2);
  const pointsRedeemed = redeemPoints ? maxRedeemablePoints : 0;
  const discount = pointsToKsh(pointsRedeemed);
  const total = Math.max(subtotal - discount, subtotal > 0 ? 1 : 0);
  const canPay = method === "M-PESA" ? !!phone : !!email;

  async function handlePay() {
    const result = await onSubmit?.({
      eventId: event.id,
      tierId,
      quantity,
      amount: subtotal,
      method,
      phoneNumber: phone || undefined,
      email: email || undefined,
      referralCode: referralCode || undefined,
      pointsRedeemed: pointsRedeemed || undefined,
    });
    if (result?.redirectUrl) {
      // Card / Bank — IntaSend's hosted checkout, then back to /pay/complete.
      window.location.href = result.redirectUrl;
    } else if (result?.apiRef) {
      // M-Pesa — let the "sent" checkmark play for a beat, then take the
      // buyer to a real confirmation screen that polls until the webhook
      // has actually finished creating the ticket.
      setTimeout(() => {
        window.location.href = `/pay/complete?api_ref=${result.apiRef}`;
      }, 1700);
    }
  }

  return (
    <Portal>
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="ticket-perforation glass-deep w-full max-w-[480px] max-h-[88vh] overflow-y-auto rounded-t-[36px] p-6 pb-32"
        >
          <div className="flex justify-center mb-4">
            <div className="h-1 w-12 rounded-full bg-black/10" />
          </div>

          <div className="flex items-center justify-between mb-5">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[22px] font-medium tracking-tight"
            >
              {event.title}
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="glass h-10 w-10 rounded-full flex items-center justify-center text-secondary text-lg"
            >
              ×
            </motion.button>
          </div>

          {event.poster_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="h-[160px] w-full rounded-2xl mb-6 bg-cover bg-center"
              style={{ backgroundImage: `url(${event.poster_url})` }}
            />
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[14px] font-medium mb-3"
          >
            Select ticket tier
          </motion.p>
          <div className="flex gap-2 mb-6">
            {event.tiers.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTierId(t.id)}
                className={[
                  "flex-1 rounded-2xl border-2 p-4 text-left transition-all duration-300",
                  t.id === tierId
                    ? "bg-ink text-white border-ink shadow-glow"
                    : "glass border-white/60 text-secondary hover:border-ink/20",
                ].join(" ")}
              >
                <div className="mb-1.5">
                  <TierBadge tierName={t.tier_name} size="sm" animated={false} />
                </div>
                <p className="text-[18px] font-medium tracking-tight">
                  KSh {t.price.toLocaleString()}
                </p>
                <p className="text-[11px] mt-1 opacity-60">{t.description}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-6 py-4 border-y border-black/5"
          >
            <div>
              <p className="text-[15px] font-medium">Number of tickets</p>
              <p className="text-[12px] text-tertiary capitalize">{tier?.tier_name} admission</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="glass h-10 w-10 rounded-xl text-[18px] font-medium flex items-center justify-center"
              >
                −
              </motion.button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[20px] font-medium w-8 text-center"
              >
                {quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="glass h-10 w-10 rounded-xl text-[18px] font-medium flex items-center justify-center"
              >
                +
              </motion.button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-[14px] font-medium mb-3"
          >
            Pay with
          </motion.p>
          <div className="flex gap-2 mb-5">
            {METHODS.map((m, i) => (
              <motion.button
                key={m.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMethod(m.value)}
                className={[
                  "flex-1 rounded-xl border-2 px-3 py-2.5 text-[13px] font-medium transition-all",
                  m.value === method ? "bg-ink text-white border-ink" : "glass border-white/60 text-secondary",
                ].join(" ")}
              >
                {m.label}
              </motion.button>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            {method === "M-PESA" ? (
              <input
                type="tel"
                placeholder="M-Pesa phone number (07XX XXX XXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full glass rounded-2xl px-5 py-4 text-[15px] mb-6 outline-none placeholder:text-tertiary"
              />
            ) : (
              <input
                type="email"
                placeholder="Email for receipt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass rounded-2xl px-5 py-4 text-[15px] mb-6 outline-none placeholder:text-tertiary"
              />
            )}
          </motion.div>

          {pointsBalance > 0 && maxRedeemablePoints > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58 }}
              onClick={() => setRedeemPoints((v) => !v)}
              className={[
                "w-full flex items-center justify-between rounded-2xl px-4 py-3 mb-4 text-left transition-colors",
                redeemPoints ? "bg-gold/15 border border-gold/40" : "glass border border-white/60",
              ].join(" ")}
            >
              <span className="text-[13px] font-medium">
                Use {maxRedeemablePoints} pts (−KSh {pointsToKsh(maxRedeemablePoints)})
              </span>
              <span
                className={[
                  "h-5 w-9 rounded-full transition-colors relative",
                  redeemPoints ? "bg-ink" : "bg-black/15",
                ].join(" ")}
              >
                <motion.span
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
                  animate={{ left: redeemPoints ? "18px" : "2px" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </span>
            </motion.button>
          )}

          {referralCode && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[11px] text-secondary mb-4"
            >
              Referral code <span className="font-mono">{referralCode}</span> applied — your friend earns points once this ticket is paid.
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between mb-6"
          >
            <span className="text-[15px] font-medium">Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[28px] font-medium tracking-tight"
            >
              KSh {total.toLocaleString()}
            </motion.span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <PaymentButton amount={total} method={method} onPay={handlePay} disabled={!canPay} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </Portal>
  );
}
