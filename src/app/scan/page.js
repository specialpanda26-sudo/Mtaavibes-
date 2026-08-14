"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ScanPage() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // { state: 'invalid'|'valid'|'used'|'pending'|'forbidden', ticket? }

  // Security fix: this page had NO auth check at all — anyone with the
  // URL could scan (and permanently burn) any ticket for any event, for
  // any organizer, with zero login. Gate it behind the same Supabase
  // organizer session the dashboard already requires.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function handleValidate() {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*, event:events(title, organizer_id), tier:event_tiers(tier_name)")
      .eq("qr_code", code)
      .single();

    if (!ticket) {
      setResult({ state: "invalid" });
      return;
    }

    // Belt-and-suspenders: even with RLS restricting the update below to
    // the organizer's own events, check here too so we can show a clear
    // "not your event" message instead of a silent failed update.
    if (ticket.event?.organizer_id !== user.id) {
      setResult({ state: "forbidden" });
      return;
    }

    if (ticket.status === "used") {
      setResult({ state: "used", ticket });
      return;
    }

    if (ticket.status === "pending") {
      setResult({ state: "pending", ticket });
      return;
    }

    // status === 'paid' → mark as used
    await supabase
      .from("tickets")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", ticket.id);

    setResult({ state: "valid", ticket });
  }

  if (user === undefined) {
    return <main className="px-4 pt-10 text-center text-[13px] text-tertiary">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-[14px] text-secondary mb-4">Sign in as an organizer to scan tickets.</p>
        <a href="/login" className="inline-block rounded-button bg-ink px-5 py-3 text-[14px] font-medium text-white">
          Sign in
        </a>
      </main>
    );
  }

  return (
    <main className="px-4 pt-8">
      <h1 className="text-[18px] font-medium mb-4">Scan tickets</h1>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter QR code or scan"
        className="glass w-full rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
      />
      <button
        onClick={handleValidate}
        className="w-full rounded-button bg-ink py-3 text-[14px] font-medium text-white mb-6"
      >
        Validate
      </button>

      {result?.state === "invalid" && (
        <div className="text-center text-accentRed">
          <p className="text-[24px] font-medium">✕ Fake ticket</p>
        </div>
      )}
      {result?.state === "valid" && (
        <div className="text-center text-accentGreen">
          <p className="text-[24px] font-medium">✓ Valid — let them in</p>
          <p className="text-[13px] text-secondary mt-2">
            {result.ticket.event?.title} · {result.ticket.tier?.tier_name} × {result.ticket.quantity}
          </p>
        </div>
      )}
      {result?.state === "used" && (
        <div className="text-center text-orange-500">
          <p className="text-[24px] font-medium">⚠ Already scanned</p>
          <p className="text-[13px] text-secondary mt-2">
            Used at {new Date(result.ticket.used_at).toLocaleString("en-KE")}
          </p>
        </div>
      )}
      {result?.state === "pending" && (
        <div className="text-center text-secondary">
          <p className="text-[24px] font-medium">Payment pending</p>
        </div>
      )}
      {result?.state === "forbidden" && (
        <div className="text-center text-accentRed">
          <p className="text-[24px] font-medium">✕ Not your event</p>
          <p className="text-[13px] text-secondary mt-2">This ticket belongs to a different organizer's event.</p>
        </div>
      )}
    </main>
  );
}
