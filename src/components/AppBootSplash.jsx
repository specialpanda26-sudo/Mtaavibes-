"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingRing from "./LoadingRing";

// Full-screen boot animation: draws the mtaa vibes wordmark, keeps it
// gently animating while the app loads underneath, then "booms" outward
// to reveal the site. Shows once per browser session (sessionStorage).
//
// Background matches the site's own gradient (not a black/dark screen)
// so the transition into the app is seamless instead of a color jump.
const BOOT_KEY = "mtaavibes-booted";
const HOLD_MS = 9350;
const EXIT_MS = 650;
const SITE_GRADIENT =
  "linear-gradient(165deg, #f5f5f7 0%, #e8e8ec 30%, #dddde2 60%, #d5d5db 100%)";

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
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: SITE_GRADIENT }}
        >
          {/* boom flash — a soft brighten rather than a hard white flash,
              since the backdrop is already light */}
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={booming ? { opacity: [0, 0.7, 0] } : { opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* ambient brand glows */}
          <motion.div
            className="absolute h-[420px] w-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.3), transparent 70%)" }}
            animate={
              booming
                ? { scale: 2.6, opacity: 0 }
                : { scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }
            }
            transition={
              booming
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            className="absolute h-[280px] w-[280px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(220,38,38,0.18), transparent 70%)" }}
            animate={
              booming
                ? { scale: 2.4, opacity: 0 }
                : { scale: [1.08, 1, 1.08], opacity: [0.4, 0.75, 0.4] }
            }
            transition={
              booming
                ? { duration: 0.6, ease: "easeOut" }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
            }
          />

          {/* wordmark — draws in once, then keeps a slow continuous
              breathing motion for the rest of the hold so a 10s wait
              never looks static */}
          <motion.div
            className="relative flex flex-col items-center"
            animate={
              booming
                ? { scale: 1.35, opacity: 0 }
                : drawn
                ? { scale: [1, 1.045, 1], opacity: 1 }
                : { scale: 1, opacity: 1 }
            }
            transition={
              booming
                ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                : drawn
                ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5 }
            }
          >
            <svg width="84" height="84" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="mb-4">
              <motion.path
                d="M4 20 L9 8 L14 20 L19 8 L24 20"
                stroke="#0a0a0a"
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
                animate={
                  booming
                    ? { scale: 0, opacity: 0 }
                    : drawn
                    ? { scale: [1, 1.3, 1], opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={
                  drawn
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                    : { delay: 0.8, duration: 0.4, ease: "backOut" }
                }
              />
            </svg>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: drawn ? 1 : 0, y: drawn ? 0 : 10 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="text-[30px] font-medium tracking-[-0.5px] text-ink"
            >
              mtaa vibes
            </motion.h1>
          </motion.div>

          {/* pulsing ring loader, mirrors the wordmark's timing */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: booming ? 0 : drawn ? 1 : 0, y: drawn ? 0 : 8 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="absolute bottom-28"
          >
            <LoadingRing size={40} label="loading" tone="dark" />
          </motion.div>

          {/* loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: booming ? 0 : drawn ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 h-[2px] w-32 overflow-hidden rounded-full bg-black/10"
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
