"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function CinematicHero() {
  const wrapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });
  const bgX = useTransform(springX, [0, 1], [-20, 20]);
  const bgY = useTransform(springY, [0, 1], [-20, 20]);
  const cardRotateX = useTransform(springY, [0, 1], [8, -8]);
  const cardRotateY = useTransform(springX, [0, 1], [-8, 8]);

  useEffect(() => {
    setTimeout(() => setReady(true), 100);
  }, []);

  function updateFromPoint(clientX, clientY) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    x.set(px);
    y.set(py);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[320px] mb-6 flex items-center justify-center overflow-hidden rounded-[32px] perspective-1200"
      onMouseMove={(e) => updateFromPoint(e.clientX, e.clientY)}
      onMouseLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      <motion.div
        className="absolute inset-[-40px] opacity-[0.04] pointer-events-none select-none flex items-center justify-center text-[80px] font-semibold tracking-tighter"
        style={{ x: bgX, y: bgY }}
      >
        MTAA
      </motion.div>
      <motion.div
        className="absolute inset-[-40px] opacity-[0.03] pointer-events-none select-none flex items-center justify-center text-[60px] font-semibold tracking-tighter translate-x-20 translate-y-12"
        style={{
          x: useTransform(springX, [0, 1], [-10, 10]),
          y: useTransform(springY, [0, 1], [-10, 10]),
        }}
      >
        VIBES
      </motion.div>

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)",
          left: useTransform(springX, [0, 1], ["10%", "70%"]),
          top: useTransform(springY, [0, 1], ["10%", "70%"]),
          x: "-50%",
          y: "-50%",
        }}
      />

      <motion.div
        className={`glass-deep relative w-[240px] rounded-card p-6 preserve-3d ${
          ready ? "animate-card-in" : "opacity-0"
        }`}
        style={{
          rotateX: cardRotateX,
          rotateY: cardRotateY,
        }}
        initial={{ opacity: 0, y: 60, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div style={{ transform: "translateZ(40px)" }}>
          <p className="text-[10px] text-tertiary uppercase tracking-[0.2em] mb-2">Admission</p>
          <p className="text-[18px] font-medium mb-1 leading-tight">Nairobi Fashion Week</p>
          <div
            className="h-px w-full my-4"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 6px, transparent 6px 12px)",
            }}
          />
          <p className="text-[24px] font-medium tracking-tight">KSh 1,500</p>
          <p className="text-[11px] text-tertiary mt-1">General · Aug 15 · 7PM</p>
        </motion.div>

        <motion.div
          className="absolute -top-4 -right-4 h-16 w-16 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)",
            transform: "translateZ(20px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
