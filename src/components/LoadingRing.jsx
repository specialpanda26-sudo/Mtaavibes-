"use client";
import { motion } from "framer-motion";

/**
 * Concentric pulsing-ring loader with a solid center dot — used on the boot
 * splash under the wordmark, and anywhere else we need a branded "working
 * on it" moment (payment verification, slow data fetches).
 *
 * size in px. `label` renders small caps text under the rings.
 */
export default function LoadingRing({ size = 64, label, tone = "light" }) {
  const dot = tone === "light" ? "#ffffff" : "#0a0a0a";
  const ring = tone === "light" ? "rgba(255,255,255,0.35)" : "rgba(10,10,10,0.25)";
  const textColor = tone === "light" ? "text-white/50" : "text-tertiary";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: ring, width: size, height: size }}
            initial={{ opacity: 0.9, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.5,
            }}
          />
        ))}
        <motion.span
          className="rounded-full"
          style={{ width: size * 0.22, height: size * 0.22, background: dot }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {label && (
        <p className={`text-[10px] uppercase tracking-[3px] ${textColor}`}>{label}</p>
      )}
    </div>
  );
}
