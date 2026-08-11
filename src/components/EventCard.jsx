import GlassCard from "./GlassCard";
import PriceDisplay from "./PriceDisplay";
import LiveDot from "./LiveDot";

// event: { id, title, venue, event_date, poster_url, category, lowestPrice, oldPrice, bulkDiscounts, isLive }
export default function EventCard({ event, onSelect }) {
  const date = new Date(event.event_date);
  const dateLabel = date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <GlassCard
      as="button"
      onClick={() => onSelect?.(event)}
      className="w-full text-left overflow-hidden"
    >
      <div
        className="h-36 w-full bg-gradient-to-br from-gray-300 to-gray-400"
        style={
          event.poster_url
            ? {
                backgroundImage: `url(${event.poster_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-tertiary">
            {dateLabel} · {timeLabel}
          </span>
          {event.isLive && <LiveDot />}
        </div>
        <h3 className="text-[16px] font-medium tracking-[-0.3px] mb-0.5">
          {event.title}
        </h3>
        <p className="text-[13px] text-secondary mb-3">{event.venue}</p>

        <PriceDisplay price={event.lowestPrice} oldPrice={event.oldPrice} />

        {event.bulkDiscounts?.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {event.bulkDiscounts.map((b) => (
              <span
                key={b.label}
                className="rounded-lg bg-black/[0.04] px-2.5 py-1 text-[12px] font-medium text-secondary"
              >
                {b.label} -{b.discount_percent}%
              </span>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
