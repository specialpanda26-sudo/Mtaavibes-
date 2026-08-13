"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Mounts children directly onto document.body instead of wherever the
// component happens to sit in the tree. Full-screen modals (CreateEventForm,
// PurchaseSheet, GuestListModal) need this: layout.js wraps page content in
// a `relative z-10` div, which creates its own stacking context, so any
// z-50 fixed modal rendered *inside* that div can never actually paint
// above the fixed BottomNav (z-40) — the whole div is capped at z-10 from
// the outside. Rendering via a portal escapes that trap entirely.
export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
