"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";
import SearchBar from "@/components/SearchBar";
import TabBar from "@/components/TabBar";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import PurchaseSheet from "@/components/PurchaseSheet";

const TABS = [{ value: "all", label: "All events" }, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))];

// Session-only cache so hopping between the bottom-nav tabs doesn't blank
// the feed and refetch from scratch every time — the route fully unmounts
// on navigation (separate pages), which used to reset state to "loading"
// and show a skeleton flash even though we'd already fetched this data
// seconds earlier. We still refetch in the background to stay fresh; we
// just don't blank the screen while doing it.
const CACHE_KEY = "mtaavibes:eventsCache";

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(events) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(events));
  } catch {
    // storage full/unavailable — non-fatal, just skip caching
  }
}

export default function EventFeedPage() {
  const cached = useMemo(readCache, []);
  const [events, setEvents] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function load() {
      // Only show the skeleton if we have nothing to show yet — a
      // background refresh shouldn't blank out cards the person can
      // already see.
      if (!cached) setLoading(true);
      // Full query should join event_tiers + bulk_discounts to compute
      // lowestPrice / bulkDiscounts — see PAGE B + Section 4 schema in the build prompt.
      const { data, error } = await supabase
        .from("events")
        .select("*, event_tiers(*), bulk_discounts(*)")
        .eq("status", "live")
        .order("event_date", { ascending: true });

      if (!error && data) {
        const mapped = data.map((e) => ({
          ...e,
          lowestPrice: Math.min(...(e.event_tiers?.map((t) => t.price) ?? [0])),
          bulkDiscounts: e.bulk_discounts,
        }));
        setEvents(mapped);
        writeCache(mapped);
      }
      setLoading(false);
    }
    load();
  }, [cached]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = category === "all" || e.category === category;
      const matchesSearch =
        !search ||
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.venue.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, category, search]);

  return (
    <main className="px-4 pt-5">
      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search events, venues, artists…"
        />
      </div>

      <div className="mb-5 -mx-4">
        <TabBar tabs={TABS} activeTab={category} onChange={setCategory} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-medium">Upcoming drops</h2>
        <span className="text-[13px] text-tertiary">{filtered.length} events</span>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-[13px] text-tertiary">No events found. Try another search.</p>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((event, i) => (
          <div
            key={event.id}
            className="animate-cardIn3d"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <EventCard event={event} onSelect={() => setSelectedEvent({ ...event, tiers: event.event_tiers })} />
          </div>
        ))}
      </div>

      {selectedEvent && (
        <PurchaseSheet
          event={selectedEvent}
          pointsBalance={0 /* TODO: look up points_ledger balance for the buyer's phone once known */}
          referralCode={typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null}
          onClose={() => setSelectedEvent(null)}
          onSubmit={async (payload) => {
            // Calls the stkpush route from PAGE D — see docs/BUILD_PROMPT.md.
            // For M-Pesa this triggers an STK push to the buyer's phone; for
            // Card/Bank it returns a redirectUrl the caller sends the buyer to.
            const res = await fetch("/api/pay/stkpush", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Payment initiation failed");
            return res.json();
          }}
        />
      )}
    </main>
  );
}
