"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

// ticket: { id, qr_code, event: { title, venue, event_date }, tier_name, amount_paid, transaction_id }
export default function TicketQR({ ticket }) {
  const date = new Date(ticket.event.event_date);

  return (
    <motion.div
      id="ticket-card"
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      className="ticket-perforation holo-sweep glass mx-auto max-w-[380px] rounded-card p-6 text-center"
    >
      <div className="flex justify-center mb-5">
        <QRCodeSVG value={ticket.qr_code} size={180} />
      </div>

      <h2 className="text-[18px] font-medium mb-1">{ticket.event.title}</h2>
      <p className="text-[13px] text-secondary mb-3">
        {date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        {" · "}
        {ticket.event.venue}
      </p>

      <p className="text-[14px] font-medium mb-1 capitalize">{ticket.tier_name} admission</p>
      <p className="text-[16px] font-medium mb-3">KSh {ticket.amount_paid.toLocaleString()}</p>
      <p className="font-mono text-[12px] text-tertiary mb-4">{ticket.transaction_id}</p>

      <span className="inline-flex items-center gap-1.5 rounded-chip bg-accentGreen/10 px-3 py-1 text-[12px] font-medium text-accentGreen">
        ✓ Paid via M-Pesa
      </span>

      <p className="mt-5 text-[10px] text-tertiary">Powered by Ogolla Tech</p>
    </motion.div>
  );
}
