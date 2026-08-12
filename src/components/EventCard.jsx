"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function EventCard({ event, onSelect, index = 0 }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const date = new Date(event.event_date);
  const dateLabel = date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
  const timeLabel = date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  const discountPct =
    event.oldPrice && event.oldPrice > event.lowestPrice
      ? Math.round(((event.oldPrice - event.lowestPrice) / event.oldPrice) * 100)
      : null;

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -10, y: (px - 0.5) * 10 });
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onClick={() => onSelect?.(event)}
      className="cinematic-card glass rounded-card overflow-hidden cursor-pointer preserve-3d"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
          isHovered ? "translateY(-8px) scale(1.01)" : ""
        }`,
        transition: isHovered
          ? "transform 0.15s ease-out"
          : "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="relative h-[180px] overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: event.poster_url
              ? `url(${event.poster_url})`
              : event.gradient || "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
          }}
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
          }}
          animate={{ x: isHovered ? ["-100%", "100%"] : "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {event.isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 glass rounded-chip px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-red animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-red" />
            </span>
            <span className="text-[11px] font-medium text-white">Live now</span>
          </div>
        )}

        <div className="absolute top-4 right-4 glass rounded-chip px-3 py-1.5 text-[11px] font-medium">
          {event.badge}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <motion.h3
            className="text-[18px] font-medium text-white leading-tight mb-1"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {event.title}
          </motion.h3>
          <p className="text-[12px] text-white/80">
            {event.venue} · {dateLabel} · {timeLabel}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-4">
          {event.tiers?.map((t) => (
            <div key={t.id} className="flex-1 glass rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] text-tertiary uppercase tracking-wider">{t.tier_name}</p>
              <p className="text-[14px] font-medium">KSh {t.price}</p>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between">
          <div>
            {event.oldPrice && (
              <p className="text-[13px] text-tertiary line-through mb-0.5">
                Was KSh {event.oldPrice.toLocaleString()}
              </p>
            )}
            <p className="text-[22px] font-medium tracking-tight">
              KSh {event.lowestPrice?.toLocaleString()}
            </p>
            {discountPct && (
              <span className="inline-block mt-1 rounded-lg bg-accent-red/10 px-2.5 py-1 text-[11px] font-medium text-accent-red">
                Save {discountPct}% today
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-button bg-ink px-6 py-3 text-[14px] font-medium text-white shadow-soft"
          >
            Get ticket
          </motion.button>
        </div>

        {event.bulkDiscounts?.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-black/5">
            <span className="text-[11px] text-tertiary py-1">Bulk:</span>
            {event.bulkDiscounts.map((b) => (
              <span
                key={b.label}
                className="glass rounded-lg px-2.5 py-1 text-[11px] font-medium text-secondary"
              >
                {b.label} -{b.discount_percent}%
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
