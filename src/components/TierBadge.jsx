"use client";
import { motion } from "framer-motion";
import { getTier } from "@/lib/constants";

// Small icon per tier — kept as inline SVG (no icon library dependency).
function TierIcon({ value, size = 12 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  if (value === "gold") {
    return (
      <svg {...common}>
        <path
          d="M12 2l2.6 6.6L21 10l-5.2 4.3L17.3 21 12 17.3 6.7 21l1.5-6.7L3 10l6.4-1.4L12 2z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (value === "diamond") {
    return (
      <svg {...common}>
        <path d="M3 9l4.5-6h9L21 9l-9 12L3 9z" fill="currentColor" />
      </svg>
    );
  }
  if (value === "premium") {
    return (
      <svg {...common}>
        <path
          d="M12 2l2.4 4.8L20 8l-4 4.3L17 18l-5-2.8L7 18l1-5.7L4 8l5.6-1.2L12 2z"
          fill="currentColor"
        />
        <circle cx="12" cy="10.5" r="2.2" fill="white" fillOpacity="0.55" />
      </svg>
    );
  }
  // silver / default
  return (
    <svg {...common}>
      <path d="M12 2l2.6 6.6L21 10l-5.2 4.3L17.3 21 12 17.3 6.7 21l1.5-6.7L3 10l6.4-1.4L12 2z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/**
 * Tier badge — used on the bottom of event cards, purchase sheet tier
 * picker, and the ticket itself so a buyer/organizer can tell at a glance
 * whether they're looking at a Silver, Gold, Diamond, or Premium ticket.
 *
 * size: "sm" (chip inside a card) | "md" (default) | "lg" (ticket footer)
 */
export default function TierBadge({ tierName, size = "md", animated = true, className = "" }) {
  const tier = getTier(tierName);
  const sizes = {
    sm: "px-2 py-0.5 text-[9px] gap-1",
    md: "px-2.5 py-1 text-[10px] gap-1.5",
    lg: "px-3.5 py-1.5 text-[12px] gap-2",
  };
  const iconSize = { sm: 9, md: 11, lg: 14 }[size];

  const Comp = animated ? motion.span : "span";
  const motionProps = animated
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        whileHover: { scale: 1.06 },
        transition: { type: "spring", stiffness: 340, damping: 18 },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      className={[
        "relative inline-flex items-center rounded-full font-semibold uppercase tracking-wider text-white overflow-hidden select-none",
        sizes[size],
        className,
      ].join(" ")}
      style={{
        background: tier.gradient,
        boxShadow: `0 2px 10px ${tier.glow}`,
      }}
    >
      {/* sheen sweep */}
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-shimmer pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 65%)",
          backgroundSize: "200% 100%",
          mixBlendMode: "overlay",
        }}
      />
      <span className="relative flex items-center gap-1">
        <TierIcon value={tier.value} size={iconSize} />
        {tier.label}
      </span>
    </Comp>
  );
}
