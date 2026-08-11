"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
  "linear-gradient(135deg, #2d132c, #801336, #c72c41)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
  "linear-gradient(135deg, #232526, #414345)",
  "linear-gradient(135deg, #134e5e, #71b280)",
];

export default function FeaturedCarousel() {
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(0);
  const touchStartX = useRef(null);

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

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0 && active < events.length - 1) setActive(active + 1);
      if (delta > 0 && active > 0) setActive(active - 1);
    }
    touchStartX.current = null;
  }

  return (
    <div className="mb-10">
      <h2 className="text-[17px] font-medium mb-4 px-0">Featured drops</h2>
      <div
        className="relative flex items-center justify-center h-[220px]"
        style={{ perspective: "1200px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
                  : GRADIENTS[i % GRADIENTS.length],
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
