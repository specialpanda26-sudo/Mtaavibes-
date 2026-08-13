"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingRing from "./LoadingRing";

// Full-screen boot animation: draws the mtaa vibes wordmark, holds for a
// beat, then "booms" outward (flash + scale) to reveal the app underneath.
// Shows once per browser session (sessionStorage), not on every navigation,
// since layout.js only mounts this once per hard load anyway.
const BOOT_KEY = "mtaavibes-booted";
const HOLD_MS = 4300;
const EXIT_MS = 650;

export default function AppBootSplash() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [booming, setBooming] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(BOOT_KEY)) return;

    setVisible(true);
    const t1 = setTimeout(() => setDrawn(true), 100);
    const t2 = setTimeout(() => setBooming(true), HOLD_MS);
    const t3 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(BOOT_KEY, "1");
    }, HOLD_MS + EXIT_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-ink overflow-hidden"
        >
          {/* boom flash */}
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={booming ? { opacity: [0, 0.9, 0] } : { opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* ambient brand glows */}
          <motion.div
            className="absolute h-[420px] w-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.28), transparent 70%)" }}
            animate={
              booming
                ? { scale: 2.6, opacity: 0 }
                : { scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }
            }
            transition={
              booming
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            className="absolute h-[280px] w-[280px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2), transparent 70%)" }}
            animate={
              booming
                ? { scale: 2.4, opacity: 0 }
                : { scale: [1.08, 1, 1.08], opacity: [0.45, 0.85, 0.45] }
            }
            transition={
              booming
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
            }
          />

          {/* wordmark */}
          <motion.div
            className="relative flex flex-col items-center"
            animate={booming ? { scale: 1.35, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="76" height="76" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="mb-4">
              <motion.path
                d="M4 20 L9 8 L14 20 L19 8 L24 20"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: drawn ? 1 : 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.circle
                cx="14"
                cy="4"
                r="2"
                fill="#dc2626"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
                transition={{ delay: 0.8, duration: 0.4, ease: "backOut" }}
              />
            </svg>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: drawn ? 1 : 0, y: drawn ? 0 : 10 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-[30px] font-medium tracking-[-0.5px] text-white"
            >
              mtaa vibes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: drawn ? 1 : 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-1.5 text-[11px] uppercase tracking-[3px] text-white/50"
            >
              kenyan events, zero stress
            </motion.p>
          </motion.div>

          {/* pulsing ring loader, mirrors the wordmark's timing */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: booming ? 0 : drawn ? 1 : 0, y: drawn ? 0 : 8 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="absolute bottom-28"
          >
            <LoadingRing size={40} label="loading" tone="light" />
          </motion.div>

          {/* loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: booming ? 0 : drawn ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 h-[2px] w-32 overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #d4af37, #dc2626)" }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
