"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/events", label: "Events", icon: "🎟️" },
  { href: "/my-tickets", label: "My tickets", icon: "🎫" },
  { href: "/dashboard", label: "Sell", icon: "➕" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass rounded-t-2xl">
      <div className="flex justify-around py-2">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium ${
                active ? "text-ink" : "text-tertiary"
              }`}
            >
              <span className="text-[16px]">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
      <p className="pb-1 text-center text-[10px] text-tertiary">Powered by Ogolla Tech</p>
    </nav>
  );
}
