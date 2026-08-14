"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TicketQR from "@/components/TicketQR";
import FlipCountdown from "@/components/FlipCountdown";
import ConfettiBurst from "@/components/ConfettiBurst";
import DeleteTicketButton from "@/components/DeleteTicketButton";

export default function TicketPage({ params }) {
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const cardWrapperRef = useRef(null);

  useEffect(() => {
    async function load() {
      // Fetched through /api/ticket/[id] (service role) rather than the
      // direct client query this used to run — now that tickets has RLS
      // enabled, a buyer landing here straight from checkout (before
      // doing any phone verification) has no session yet, so a client-side
      // anon-key query would correctly be denied. See that route for the
      // reasoning on why a service-role lookup by unguessable UUID is fine
      // here even though bulk client access to `tickets` is not.
      const res = await fetch(`/api/ticket/${params.id}`);
      const data = res.ok ? await res.json() : null;

      if (data) {
        setTicket({ ...data, tier_name: data.tier?.tier_name });
        // Landing on a freshly minted ticket page is the payoff moment —
        // small celebratory burst, once, on load.
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1500);
      }
    }
    load();
  }, [params.id]);

  async function handleDownload() {
    const html2canvas = (await import("html2canvas")).default;
    const node = document.getElementById("ticket-card");
    if (!node) return;
    const canvas = await html2canvas(node);
    const link = document.createElement("a");
    link.download = `mtaa-vibes-ticket-${params.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  if (!ticket) {
    return <main className="px-4 pt-10 text-center text-[13px] text-tertiary">Loading ticket…</main>;
  }

  return (
    <main className="px-4 pt-8" ref={cardWrapperRef}>
      <ConfettiBurst trigger={celebrate} />
      <TicketQR ticket={ticket} />

      <div className="mx-auto mt-6 max-w-[380px] text-center">
        <p className="text-[12px] text-tertiary mb-2">Doors open in</p>
        <div className="flex justify-center">
          <FlipCountdown eventDate={ticket.event.event_date} />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-[380px] gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 rounded-button bg-ink py-3 text-[14px] font-medium text-white"
        >
          Download ticket
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Here's my ticket for ${ticket.event.title} 🎟️ ${typeof window !== "undefined" ? window.location.href : ""}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-button border border-ink py-3 text-center text-[14px] font-medium"
        >
          Share to WhatsApp
        </a>
      </div>

      <div className="mx-auto mt-3 max-w-[380px]">
        <DeleteTicketButton
          ticketId={params.id}
          variant="button"
          onDeleted={() => router.push("/my-tickets")}
        />
      </div>
    </main>
  );
}
