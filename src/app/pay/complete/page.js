"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import LoadingRing from "@/components/LoadingRing";
import ConfettiBurst from "@/components/ConfettiBurst";

const POLL_INTERVAL_MS = 2500;
const TIMEOUT_MS = 60_000; // give the webhook up to a minute before we give up waiting live

// Small animated card mock, echoing PaymentButton's card visual, so the
// M-Pesa and Card/Bank flows feel like the same product instead of two
// different apps bolted together.
function StatusCard({ state }) {
  return (
    <div className="relative mx-auto mb-6 h-[130px] w-[220px]">
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl p-4 flex flex-col justify-between"
        style={{ background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-5 w-7 rounded-[4px] bg-gradient-to-br from-gold to-gold-light" />
          <span className="text-[9px] font-medium tracking-[2px] text-white/40">OGOLLA PAY</span>
        </div>
        <p className="text-[13px] tracking-[2px] text-white/80">•••• •••• •••• 9901</p>

        {state === "verifying" && (
          <motion.div
            className="absolute inset-y-0 w-14 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ left: "-56px" }}
            animate={{ left: "220px" }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}

        <AnimatePresence>
          {state === "paid" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="absolute inset-0 flex items-center justify-center bg-accent-green/90"
            >
              <motion.svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.svg>
            </motion.div>
          )}
          {state === "timeout" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70"
            >
              <span className="text-[24px] text-white/80">…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PayCompleteInner() {
  const searchParams = useSearchParams();
  const apiRef = searchParams.get("api_ref");

  const [state, setState] = useState(apiRef ? "verifying" : "no_ref");
  const [ticket, setTicket] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!apiRef) return;
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        const res = await fetch(`/api/pay/poll?api_ref=${encodeURIComponent(apiRef)}`);
        const data = await res.json();

        if (cancelled) return;

        if (data.status === "paid") {
          setTicket(data);
          setState("paid");
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 1600);
          return; // stop polling
        }

        if (Date.now() - startedAt.current > TIMEOUT_MS) {
          setState("timeout");
          return;
        }
      } catch (err) {
        console.error("Payment poll failed:", err);
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [apiRef]);

  return (
    <main className="px-4 pt-16 text-center">
      <ConfettiBurst trigger={celebrate} />
      <GlassCard className="p-6 max-w-[420px] mx-auto">
        {state === "no_ref" && (
          <>
            <p className="text-[18px] font-medium mb-2">Payment received</p>
            <p className="text-[13px] text-tertiary mb-6">
              We're confirming your payment with Ogolla Pay. Your ticket will appear on My
              Tickets once it's done.
            </p>
          </>
        )}

        {state === "verifying" && (
          <>
            <StatusCard state="verifying" />
            <p className="text-[16px] font-medium mb-1">Verifying your payment…</p>
            <p className="text-[13px] text-tertiary mb-6">
              Ogolla Pay is confirming the transaction — this usually takes a few seconds, don't
              close this page.
            </p>
            <div className="flex justify-center mb-2">
              <LoadingRing size={36} tone="dark" />
            </div>
          </>
        )}

        {state === "paid" && (
          <>
            <StatusCard state="paid" />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[18px] font-medium mb-1"
            >
              Payment successful 🎉
            </motion.p>
            <p className="text-[13px] text-tertiary mb-6">
              {ticket?.eventTitle ? `Your ticket for ${ticket.eventTitle} is ready.` : "Your ticket is ready."}
              {ticket?.amount ? ` KSh ${ticket.amount.toLocaleString()} paid.` : ""}
            </p>
          </>
        )}

        {state === "timeout" && (
          <>
            <StatusCard state="timeout" />
            <p className="text-[16px] font-medium mb-1">Still confirming…</p>
            <p className="text-[13px] text-tertiary mb-6">
              This is taking longer than usual. Your payment is safe — check My Tickets in a
              minute, or contact support if it doesn't show up.
            </p>
          </>
        )}

        <a
          href={state === "paid" && ticket?.ticketId ? `/ticket/${ticket.ticketId}` : "/my-tickets"}
          className="inline-block rounded-button bg-ink px-5 py-3 text-[14px] font-medium text-white"
        >
          {state === "paid" ? "View my ticket" : "Go to My Tickets"}
        </a>
      </GlassCard>
    </main>
  );
}

export default function PayCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="px-4 pt-16 text-center text-[13px] text-tertiary">Loading…</main>
      }
    >
      <PayCompleteInner />
    </Suspense>
  );
}
