import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Added alongside the RLS migration (003_row_level_security.sql). Before
// that migration, /ticket/[id] read straight from the client with the anon
// key, which worked but meant *anyone* could enumerate `tickets` freely.
// After locking tickets down with RLS, a buyer landing here fresh from
// checkout (before they've ever done phone verification) would otherwise
// get an empty result, since they have no session yet.
//
// This route uses the service-role key to fetch by id regardless, which is
// the same trust model most ticketing/e-commerce confirmation pages use:
// the random, unguessable UUID in the URL *is* the access token for "my
// receipt" — nobody can list or discover it, they can only look it up if
// they already have the exact link (from /pay/complete or their own
// history). Table-wide access (scanning, browsing, bulk export) is what
// RLS actually needed to stop, and still does.
export async function GET(_req, { params }) {
  const db = supabaseAdmin();
  const { data: ticket, error } = await db
    .from("tickets")
    .select("*, event:events(title, venue, event_date), tier:event_tiers(tier_name)")
    .eq("id", params.id)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
