import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Polled by /pay/complete (the page a Card/Bank buyer lands on after
// IntaSend's hosted checkout redirects them back). The webhook is what
// actually finalizes the ticket asynchronously, so this route just reports
// where things stand: still pending, or done with a ticket id to show.
export async function GET(req) {
  const apiRef = req.nextUrl.searchParams.get("api_ref");
  if (!apiRef) {
    return NextResponse.json({ error: "Missing api_ref" }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: pending } = await db
    .from("pending_payments")
    .select("invoice_id, amount_paid")
    .eq("api_ref", apiRef)
    .maybeSingle();

  if (!pending) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  const { data: ticket } = await db
    .from("tickets")
    .select("id, status, amount_paid, event:events(title)")
    .eq("transaction_id", pending.invoice_id)
    .maybeSingle();

  if (!ticket) {
    return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({
    status: "paid",
    ticketId: ticket.id,
    amount: ticket.amount_paid,
    eventTitle: ticket.event?.title,
  });
}
