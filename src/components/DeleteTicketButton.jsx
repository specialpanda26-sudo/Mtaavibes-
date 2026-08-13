"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Lets a buyer remove a ticket from their own account — "the person who
// created the ticket can delete it, from his side" per the product ask.
// This is a real delete (not a soft-hide): it removes the row from
// `tickets` entirely. It does NOT refund any M-Pesa payment — that has to
// happen separately, through the organizer/Ogolla Pay. We say so plainly
// in the confirm step so nobody deletes a ticket expecting money back.
export default function DeleteTicketButton({ ticketId, onDeleted, variant = "row" }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    setError("");
    const { error: delErr } = await supabase.from("tickets").delete().eq("id", ticketId);
    if (delErr) {
      setError("Couldn't delete — try again.");
      setDeleting(false);
      return;
    }
    onDeleted?.(ticketId);
  }

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (confirming) {
    return (
      <div
        onClick={stop}
        className={
          variant === "row"
            ? "flex items-center gap-1.5 shrink-0"
            : "rounded-2xl bg-red-50 p-4 text-center"
        }
      >
        {variant !== "row" && (
          <p className="text-[12px] text-secondary mb-3">
            This deletes the ticket permanently — it won't refund any payment. Are you sure?
          </p>
        )}
        <div className={variant === "row" ? "flex items-center gap-1.5" : "flex justify-center gap-2"}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-accentRed/10 px-2.5 py-1 text-[12px] font-medium text-accentRed disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
          <button
            onClick={(e) => {
              stop(e);
              setConfirming(false);
            }}
            className="rounded-lg bg-black/5 px-2.5 py-1 text-[12px] font-medium text-secondary"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-[11px] text-accentRed mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        stop(e);
        setConfirming(true);
      }}
      className={
        variant === "row"
          ? "shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-tertiary hover:bg-black/5"
          : "w-full rounded-button border border-accentRed/30 py-3 text-[14px] font-medium text-accentRed"
      }
      aria-label="Delete ticket"
    >
      {variant === "row" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
        </svg>
      ) : (
        "Delete ticket"
      )}
    </button>
  );
}
