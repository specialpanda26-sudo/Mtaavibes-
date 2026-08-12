"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import CinematicHero from "@/components/CinematicHero";
import FeaturedCarousel from "@/components/FeaturedCarousel";

const MARQUEE = [
  "Fashion",
  "Dressing Comp",
  "Dance",
  "Campus Night",
  "Club Night",
  "Art & Culture",
  "Vibes",
  "Kenya",
  "Turn Up",
  "Drip",
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M7 15V15.01M7 12V12.01M7 9V9.01" strokeLinecap="round" />
        <path d="M12 12H17" strokeLinecap="round" />
      </svg>
    ),
    title: "M-Pesa checkout",
    desc: "STK push straight to your phone. No card forms. No stress.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M9 6V18" strokeDasharray="4 2" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        <path d="M15 10L15 14M13 12H17" strokeLinecap="round" />
      </svg>
    ),
    title: "QR tickets, no fakes",
    desc: "Unique QR per ticket. Scan at the door. Screenshots don't work.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20V10M12 10L18 14M12 10L6 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 4L12 8L6 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Real-time dashboard",
    desc: "See your ticket sales live. Know exactly how much you've made.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative px-4 pt-2 overflow-hidden">
      <section className="relative -mx-4 px-4 pt-6 pb-12 mb-4 gradient-mesh rounded-b-[40px] overflow-hidden">
        <div className="flex justify-end mb-6">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-chip bg-ink px-4 py-1.5 text-[11px] font-medium text-white tracking-wide"
          >
            beta
          </motion.span>
        </div>

        <CinematicHero />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-headline mb-3 max-w-[380px]"
        >
          Kenyan events, <span className="text-gold">zero stress</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="editorial-subhead mb-8 max-w-[340px]"
        >
          Fashion shows, dressing competitions, dance events, campus nights & club events. Pay with
          M-Pesa. Get instant QR tickets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex gap-3"
        >
          <Link
            href="/events"
            className="magnetic-btn glass-btn rounded-button bg-ink px-6 py-3.5 text-[14px] font-medium text-white inline-flex items-center gap-2"
          >
            Browse events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="magnetic-btn glass-btn rounded-button border border-ink/20 px-6 py-3.5 text-[14px] font-medium inline-flex items-center gap-2"
          >
            Sell tickets
          </Link>
        </motion.div>
      </section>

      <section className="relative -mx-4 mb-12 overflow-hidden py-4">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="text-[14px] text-tertiary font-medium tracking-wide whitespace-nowrap">
              {item}
              <span className="mx-6 text-tertiary/30">·</span>
            </span>
          ))}
        </div>
      </section>

      <FeaturedCarousel />

      <section className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[20px] font-medium mb-6"
        >
          Why Mtaa Vibes
        </motion.h2>
        <div className="grid gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="glass rounded-card p-5"
            >
              <div className="mb-3 text-ink">{f.icon}</div>
              <h3 className="text-[15px] font-medium mb-1">{f.title}</h3>
              <p className="text-[13px] text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[20px] font-medium mb-8"
        >
          How it works
        </motion.h2>
        <div className="relative pl-8 border-l border-black/10 space-y-10">
          {[
            { num: "01", title: "Create your event", desc: "Set your tiers, pricing, and bulk discounts. Upload your poster." },
            { num: "02", title: "Share your link", desc: "Post to WhatsApp, Instagram, Twitter. Your custom link handles everything." },
            { num: "03", title: "Get paid", desc: "Buyers pay via M-Pesa. You get 90% straight to your M-Pesa. We handle the rest." },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative"
            >
              <span className="absolute -left-[39px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-white">
                {step.num}
              </span>
              <h3 className="text-[16px] font-medium mb-1">{step.title}</h3>
              <p className="text-[13px] text-secondary">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="pb-24 text-center">
        <div className="flex justify-center gap-6 text-[13px] text-secondary mb-3">
          <Link href="/events" className="hover:text-ink transition-colors">
            Events
          </Link>
          <Link href="/dashboard" className="hover:text-ink transition-colors">
            Sell tickets
          </Link>
          <span className="hover:text-ink transition-colors cursor-pointer">About</span>
          <span className="hover:text-ink transition-colors cursor-pointer">Contact</span>
        </div>
        <p className="text-[12px] text-tertiary">Powered by Ogolla Tech</p>
      </footer>
    </main>
  );
}
