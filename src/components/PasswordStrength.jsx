"use client";

import { motion } from "framer-motion";

// Ported from password-strength.html — same entropy math and "door →
// paperclip → padlock → deadbolt → vault" tier ladder, re-themed from the
// original's dark neon palette to the site's light glass / ink / gold look
// so it sits naturally under the signup form's password field instead of
// looking like a pasted-in widget.

const TIERS = [
  { key: "door", min: 0, color: "#a3a3a3", title: "No lock at all" },
  { key: "paperclip", min: 1, color: "#dc2626", title: "A bent paperclip" },
  { key: "padlock", min: 40, color: "#d4af37", title: "A padlock" },
  { key: "deadbolt", min: 50, color: "#8a9a2e", title: "A deadbolt" },
  { key: "vault", min: 65, color: "#16a34a", title: "A bank vault" },
];

const COMMON_WEAK = new Set([
  "password", "123456", "12345678", "qwerty", "letmein", "admin", "welcome",
  "iloveyou", "monkey", "football", "abc123", "111111", "123123", "dragon",
  "password1", "qwertyuiop", "000000",
]);

function isSequential(str) {
  if (str.length < 4) return false;
  let asc = true, desc = true;
  for (let i = 1; i < str.length; i++) {
    const diff = str.charCodeAt(i) - str.charCodeAt(i - 1);
    if (diff !== 1) asc = false;
    if (diff !== -1) desc = false;
  }
  return asc || desc;
}

function isRepeated(str) {
  return str.length >= 3 && new Set(str.split("")).size === 1;
}

export function computeEntropy(pw) {
  if (!pw) return 0;
  const lower = /[a-z]/.test(pw);
  const upper = /[A-Z]/.test(pw);
  const digit = /[0-9]/.test(pw);
  const symbol = /[^a-zA-Z0-9]/.test(pw);

  let pool = 0;
  if (lower) pool += 26;
  if (upper) pool += 26;
  if (digit) pool += 10;
  if (symbol) pool += 32;
  if (pool === 0) pool = 26;

  let bits = Math.floor(pw.length * Math.log2(pool));

  if (COMMON_WEAK.has(pw.toLowerCase())) bits = Math.min(bits, 6);
  if (isRepeated(pw)) bits = Math.round(bits * 0.15);
  if (isSequential(pw.toLowerCase())) bits = Math.round(bits * 0.25);

  return Math.max(0, bits);
}

function tierFor(bits) {
  let t = TIERS[0];
  for (const tier of TIERS) if (bits >= tier.min) t = tier;
  return t;
}

export default function PasswordStrength({ password }) {
  const bits = computeEntropy(password);
  const tier = tierFor(bits);
  const pct = Math.min(100, Math.round((bits / 70) * 100));

  if (!password) return null;

  return (
    <div className="mb-4 -mt-1">
      <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden mb-1.5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: tier.color }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: tier.color }}>
          {tier.title}
        </span>
        <span className="text-[11px] text-tertiary">{bits} bits</span>
      </div>
    </div>
  );
}
