"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// 3D "coverflow" strip of upcoming events — pure CSS 3D transforms (no WebGL
// dependency), so it stays light and works everywhere. Center card is
// full-size and facing forward; neighbors rotate away in depth.
export default function FeaturedCarousel() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("events")
        .select("id, title, venue, poster_url, event_date")
        .eq("status", "live")
        .order("event_date", { ascending: true })
        .limit(6);
      if (data?.length) setEvents(data);
    }
    load();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-[17px] font-medium mb-4 px-0">Featured drops</h2>
      <div
        className="relative flex items-center justify-center h-[220px]"
        style={{ perspective: "1200px" }}
      >
        {events.map((e, i) => {
          const offset = i - active;
          const isActive = offset === 0;
          const abs = Math.abs(offset);
          if (abs > 2) return null;

          return (
            <button
              key={e.id}
              onClick={() => setActive(i)}
              className="absolute rounded-card overflow-hidden shadow-soft transition-all duration-500 ease-out"
              style={{
                width: isActive ? "180px" : "150px",
                height: isActive ? "220px" : "190px",
                transform: `
                  translateX(${offset * 92}px)
                  translateZ(${isActive ? 0 : -80}px)
                  rotateY(${offset * -28}deg)
                  scale(${isActive ? 1 : 0.88})
                `,
                zIndex: 10 - abs,
                opacity: abs > 2 ? 0 : 1 - abs * 0.18,
                background: e.poster_url
                  ? `url(${e.poster_url}) center/cover`
                  : "linear-gradient(160deg, #d4d4d4, #a3a3a3)",
              }}
            >
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left">
                  <p className="text-[12px] font-medium text-white leading-tight">{e.title}</p>
                  <p className="text-[10px] text-white/75">{e.venue}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {events.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-4 bg-ink" : "w-1.5 bg-black/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
