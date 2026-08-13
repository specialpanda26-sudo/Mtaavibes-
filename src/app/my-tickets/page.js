"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TabBar from "@/components/TabBar";
import GlassCard from "@/components/GlassCard";
import ReferralCard from "@/components/ReferralCard";
import DeleteTicketButton from "@/components/DeleteTicketButton";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

// TODO: replace with real phone-based session lookup (OTP or saved session per PAGE H)
function useBuyerPhone() {
  const [phone, setPhone] = useState(null);
  useEffect(() => {
    setPhone(typeof window !== "undefined" ? localStorage.getItem("buyerPhone") : null);
  }, []);
  return phone;
}

// Same problem as the events feed: this route fully unmounts when you tap
// away to another tab, so without a cache the "No tickets yet" empty state
// flashes for a moment on every return visit, right before the real
// tickets pop back in. Cache per-phone in sessionStorage so a return visit
// shows what we already know instantly, then quietly refreshes.
function cacheKey(phone) {
  return `mtaavibes:ticketsCache:${phone}`;
}
function readTicketsCache(phone) {
  if (typeof window === "undefined" || !phone) return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(phone));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeTicketsCache(phone, tickets) {
  if (typeof window === "undefined" || !phone) return;
  try {
    sessionStorage.setItem(cacheKey(phone), JSON.stringify(tickets));
  } catch {
    // non-fatal
  }
}

export default function MyTicketsPage() {
  const phone = useBuyerPhone();
  const [tab, setTab] = useState("upcoming");
  const [tickets, setTickets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [referral, setReferral] = useState(null);

  // Once we know the phone, hydrate instantly from cache if we have it.
  useEffect(() => {
    if (!phone) return;
    const cached = readTicketsCache(phone);
    if (cached) {
      setTickets(cached);
      setLoaded(true);
    }
  }, [phone]);

  useEffect(() => {
    if (!phone) return;

    async function load() {
      const { data } = await supabase
        .from("tickets")
        .select("*, event:events(title, poster_url, event_date, venue)")
        .eq("buyer_phone", phone)
        .order("paid_at", { ascending: false });
      setTickets(data ?? []);
      writeTicketsCache(phone, data ?? []);
      setLoaded(true);

      // Points balance = sum(earn) - sum(redeem) from points_ledger
      const { data: ledger } = await supabase
        .from("points_ledger")
        .select("type, amount")
        .eq("phone", phone);
      const balance = (ledger ?? []).reduce(
        (acc, row) => acc + (row.type === "earn" ? row.amount : -row.amount),
        0
      );

      const { data: existingReferral } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_phone", phone)
        .limit(1)
        .maybeSingle();

      const code = existingReferral?.referral_code ?? phone.replace(/\D/g, "").slice(-6);
      const { count: friendsReferred } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_phone", phone)
        .eq("reward_status", "earned");

      setReferral({
        code,
        link: `${window.location.origin}/events?ref=${code}`,
        pointsBalance: balance,
        friendsReferred: friendsReferred ?? 0,
      });
    }
    load();
  }, [phone]);

  const filtered = useMemo(() => {
    const now = new Date();
    return tickets.filter((t) => {
      if (tab === "all") return true;
      const eventDate = new Date(t.event?.event_date);
      return tab === "upcoming" ? eventDate >= now : eventDate < now;
    });
  }, [tickets, tab]);

  function handleTicketDeleted(ticketId) {
    setTickets((prev) => {
      const next = prev.filter((t) => t.id !== ticketId);
      writeTicketsCache(phone, next);
      return next;
    });
  }

  if (!phone) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-[14px] text-secondary mb-4">
          Enter the phone number you used at checkout to see your tickets.
        </p>
        {/* TODO: wire to real OTP flow from PAGE H instead of a bare input */}
      </main>
    );
  }

  function handleSwitchNumber() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("buyerPhone");
    window.location.reload();
  }

  return (
    <main className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[18px] font-medium">My tickets</h1>
        <button
          onClick={handleSwitchNumber}
          className="rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary"
        >
          Not you? Switch number
        </button>
      </div>

      <div className="mb-5 -mx-4">
        <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />
      </div>

      {loaded && filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-[14px] text-secondary mb-4">No tickets yet</p>
          <Link
            href="/events"
            className="inline-block rounded-button bg-ink px-5 py-3 text-[14px] font-medium text-white"
          >
            Browse events
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((ticket) => (
          <Link key={ticket.id} href={`/ticket/${ticket.id}`}>
            <GlassCard className="flex items-center gap-3 p-3">
              <div
                className="h-14 w-14 shrink-0 rounded-2xl bg-gray-300 bg-cover bg-center"
                style={ticket.event?.poster_url ? { backgroundImage: `url(${ticket.event.poster_url})` } : undefined}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{ticket.event?.title}</p>
                <p className="text-[12px] text-tertiary truncate">{ticket.event?.venue}</p>
              </div>
              <span
                className={`rounded-chip px-2.5 py-1 text-[11px] font-medium ${
                  ticket.status === "used" ? "bg-black/5 text-tertiary" : "bg-accentGreen/10 text-accentGreen"
                }`}
              >
                {ticket.status === "used" ? "Used" : "Paid"}
              </span>
              <DeleteTicketButton ticketId={ticket.id} onDeleted={handleTicketDeleted} variant="row" />
            </GlassCard>
          </Link>
        ))}
      </div>

      {referral && <ReferralCard referral={referral} />}
    </main>
  );
}
