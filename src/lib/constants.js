// Single source of truth for the referral/points mechanic.
// Tune these two numbers before launch — nothing else in the codebase
// should hardcode a points value or conversion rate.

// Points credited to the referrer when someone they invited completes a paid purchase.
export const REFERRAL_POINTS_PER_SIGNUP = 100;

// Redemption rate: how many points equal KSh 1 off at checkout.
// 2 points = KSh 1, so 100 points ≈ KSh 50.
export const POINTS_TO_KSH_RATE = 2;

export function pointsToKsh(points) {
  return Math.floor(points / POINTS_TO_KSH_RATE);
}

// Platform commission taken from every ticket sale.
export const COMMISSION_RATE = 0.1; // 10%

// Ticket tier system — every event now sells up to 4 tiers, each rendered
// everywhere (event cards, purchase sheet, ticket, scanner) as a colored
// badge instead of plain text. Order matters: index = rank, low to high.
export const TIERS = [
  {
    value: "silver",
    label: "Silver",
    defaultDescription: "Standard entry",
    color: "#8a8f98",
    gradient: "linear-gradient(135deg, #e4e7eb 0%, #9aa0a8 55%, #6b7078 100%)",
    glow: "rgba(148,163,184,0.35)",
  },
  {
    value: "gold",
    label: "Gold",
    defaultDescription: "Priority queue + welcome drink",
    color: "#d4af37",
    gradient: "linear-gradient(135deg, #f9e79f 0%, #d4af37 55%, #a8791f 100%)",
    glow: "rgba(212,175,55,0.4)",
  },
  {
    value: "diamond",
    label: "Diamond",
    defaultDescription: "VIP lounge + fast track entry",
    color: "#38bdf8",
    gradient: "linear-gradient(135deg, #e0f7ff 0%, #7dd3fc 45%, #0ea5e9 100%)",
    glow: "rgba(56,189,248,0.4)",
  },
  {
    value: "premium",
    label: "Premium",
    defaultDescription: "All-access + backstage",
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #f3e8ff 0%, #c084fc 45%, #7c3aed 100%)",
    glow: "rgba(168,85,247,0.4)",
  },
];

export function getTier(value) {
  return TIERS.find((t) => t.value === value) ?? TIERS[0];
}

export const CATEGORIES = [
  { value: "fashion", label: "Fashion" },
  { value: "dressing", label: "Dressing Comp" },
  { value: "dance", label: "Dance" },
  { value: "campus", label: "Campus" },
  { value: "club", label: "Club Night" },
  { value: "art", label: "Art & Culture" },
  { value: "other", label: "Other" },
];

// Regex used to block phone numbers being pasted into event descriptions
// (buyers must pay through Mtaa Vibes, not a side M-Pesa number).
export const KENYAN_PHONE_REGEX = /(\+?254|0)?[71]\d{8}/g;
