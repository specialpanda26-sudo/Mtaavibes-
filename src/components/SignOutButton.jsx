"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Signs the organizer out of Supabase auth and sends them back to /login.
// This was missing entirely from the app — you could sign in, but never
// out. Includes a lightweight confirm to avoid accidental taps.
export default function SignOutButton({ className = "" }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-[12px] text-secondary">Sign out?</span>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="rounded-lg bg-accent-red/10 px-2.5 py-1 text-[12px] font-medium text-accent-red disabled:opacity-50"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg bg-black/5 px-2.5 py-1 text-[12px] font-medium text-secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={`rounded-lg bg-black/5 px-3 py-1.5 text-[12px] font-medium text-secondary ${className}`}
    >
      Sign out
    </button>
  );
}
