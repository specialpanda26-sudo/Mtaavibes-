"use client";
import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const handler = (e) => {
      document.documentElement.style.setProperty("--x", e.clientX + "px");
      document.documentElement.style.setProperty("--y", e.clientY + "px");
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return <div className="cursor-glow" aria-hidden="true" />;
}
