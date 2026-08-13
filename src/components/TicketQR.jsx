"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import TierBadge from "./TierBadge";

export default function TicketQR({ ticket }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const date = new Date(ticket.event?.event_date);

  function handleMove(clientX, clientY) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -12, y: (px - 0.5) * 12 });
  }

  return (
    <motion.div
      ref={cardRef}
      id="ticket-card"
      initial={{ opacity: 0, rotateY: -90, scale: 0.9 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={() => setTilt({ x: 0, y: 0 })}
      className="ticket-perforation holo-sweep glass-deep mx-auto max-w-[400px] rounded-card p-8 text-center preserve-3d cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease-out",
        boxShadow: `${tilt.y * -1.5}px ${tilt.x * 1.5}px 40px rgba(0,0,0,0.15)`,
      }}
    >
      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-gold/30 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-gold/30 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-gold/30 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-gold/30 rounded-br-lg" />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="absolute top-4 right-4 glass rounded-full px-3 py-1"
      >
        <span className="text-[10px] font-medium text-gold tracking-wider uppercase">Verified</span>
      </motion.div>

      <motion.div
        className="flex justify-center mb-6"
        style={{ transform: "translateZ(50px)" }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="relative">
          <QRCodeSVG value={ticket.qr_code} size={200} />
          <div className="absolute inset-0 rounded-xl border border-gold/20 pointer-events-none" />
        </div>
      </motion.div>

      <motion.div
        style={{ transform: "translateZ(30px)" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-[20px] font-medium mb-1 tracking-tight">{ticket.event?.title}</h2>
        <p className="text-[13px] text-secondary mb-4">
          {date.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {ticket.event?.venue}
        </p>

        <div className="flex justify-center mb-4">
          <TierBadge tierName={ticket.tier_name} size="lg" />
        </div>

        <div className="flex justify-center gap-6 mb-4 text-[12px]">
          <div>
            <p className="text-tertiary text-[10px] uppercase tracking-wider mb-0.5">Price</p>
            <p className="font-medium">KSh {ticket.amount_paid?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-tertiary text-[10px] uppercase tracking-wider mb-0.5">Qty</p>
            <p className="font-medium">{ticket.quantity}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 glass rounded-chip px-4 py-2 mb-4">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span className="text-[12px] font-medium text-accent-green">Paid via M-Pesa</span>
        </div>

        <p className="text-[11px] text-tertiary font-mono">{ticket.transaction_id}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-5 pt-4 border-t border-black/5 flex items-center justify-center gap-2"
      >
        <TierBadge tierName={ticket.tier_name} size="sm" animated={false} />
        <span className="text-[10px] text-tertiary">member ticket</span>
      </motion.div>
    </motion.div>
  );
}
