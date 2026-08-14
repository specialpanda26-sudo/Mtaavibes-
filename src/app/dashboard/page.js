"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import CreateEventForm from "@/components/CreateEventForm";
import GuestListModal from "@/components/GuestListModal";
import SignOutButton from "@/components/SignOutButton";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [guestListEventId, setGuestListEventId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data: ev } = await supabase
        .from("events")
        .select("*, tickets(quantity, amount_paid, commission_paid, organizer_paid)")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });
      setEvents(ev ?? []);
    }
    load();
  }, []);

  if (!user) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-[14px] text-secondary mb-4">Sign in to manage your events.</p>
        <a href="/login" className="inline-block rounded-button bg-ink px-5 py-3 text-[14px] font-medium text-white">
          Sign in
        </a>
      </main>
    );
  }

  const totals = events.reduce(
    (acc, e) => {
      acc.eventsCount += 1;
      // Bug fix: each `tickets` row can represent more than one admission
      // (PurchaseSheet lets a buyer select quantity > 1 in a single
      // checkout), so counting *rows* undercounted actual tickets sold
      // whenever anyone bought more than one at a time. Sum `quantity`.
      const sold = e.tickets?.reduce((s, t) => s + (t.quantity ?? 1), 0) ?? 0;
      const earnings = e.tickets?.reduce((s, t) => s + (t.organizer_paid ?? 0), 0) ?? 0;
      acc.ticketsSold += sold;
      acc.earnings += earnings;
      return acc;
    },
    { eventsCount: 0, ticketsSold: 0, earnings: 0 }
  );

  return (
    <main className="px-4 pt-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[18px] font-medium">Dashboard</h1>
          <p className="text-[12px] text-tertiary truncate max-w-[220px]">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <GlassCard className="p-4">
          <p className="text-[11px] text-tertiary mb-1">Events</p>
          <p className="text-[20px] font-medium">{totals.eventsCount}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[11px] text-tertiary mb-1">Tickets sold</p>
          <p className="text-[20px] font-medium">{totals.ticketsSold}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[11px] text-tertiary mb-1">Earnings</p>
          <p className="text-[20px] font-medium">KSh {totals.earnings.toLocaleString()}</p>
        </GlassCard>
      </div>

      <button
        onClick={() => setShowCreateForm(true)}
        className="w-full rounded-button bg-ink py-3 text-[14px] font-medium text-white mb-6"
      >
        + Create event
      </button>

      <p className="text-[14px] font-medium mb-3">My events</p>
      <div className="flex flex-col gap-3">
        {events.map((e) => {
          const sold = e.tickets?.reduce((s, t) => s + (t.quantity ?? 1), 0) ?? 0;
          const revenue = e.tickets?.reduce((s, t) => s + t.amount_paid, 0) ?? 0;
          const commission = e.tickets?.reduce((s, t) => s + t.commission_paid, 0) ?? 0;
          const net = revenue - commission;
          return (
            <GlassCard key={e.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-medium">{e.title}</p>
                <span className="rounded-chip bg-black/5 px-2.5 py-1 text-[11px] font-medium text-secondary capitalize">
                  {e.status}
                </span>
              </div>
              <p className="text-[12px] text-tertiary mb-3">
                {sold} sold · revenue KSh {revenue.toLocaleString()} · commission KSh {commission.toLocaleString()} · net KSh {net.toLocaleString()}
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setGuestListEventId(e.id)}
                  className="rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary"
                >
                  Guest list
                </button>
                <a href="/scan" className="rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary">
                  Scan tickets
                </a>
                <button className="rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary">
                  Edit
                </button>
                <button className="rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary">
                  {e.status === "paused" ? "Resume" : "Pause"}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {showCreateForm && (
        <CreateEventForm
          organizerId={user.id}
          onClose={() => setShowCreateForm(false)}
          onCreated={(event) => setEvents((prev) => [event, ...prev])}
        />
      )}
      {guestListEventId && (
        <GuestListModal eventId={guestListEventId} onClose={() => setGuestListEventId(null)} />
      )}
    </main>
  );
}
