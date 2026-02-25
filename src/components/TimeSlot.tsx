import { useRef, useEffect } from "react";
import type { ScheduleEvent } from "../types.ts";
import { formatHourLabel, getDayKey, formatDayShort } from "../lib/dates.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  hour: number;
  events: ScheduleEvent[];
  favorites: Set<number>;
  compact?: boolean;
  isCurrent?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function TimeSlot({ hour, events, favorites, compact, isCurrent, onToggleFavorite, onSelectEvent }: Props) {
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrent && dividerRef.current) {
      dividerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCurrent]);

  const baseDivider = "sticky top-[5.5rem] -mx-4 px-4 sm:-mx-6 sm:px-6 py-1.5 backdrop-blur-sm border-b";
  const dividerClass = isCurrent
    ? `${baseDivider} bg-accent-subtle`
    : `${baseDivider} bg-surface/95 border-border-light`;

  const labelClass = isCurrent
    ? "font-display text-xs font-700 text-accent tracking-wide"
    : "font-display text-xs font-700 text-ink-faint tracking-wide";

  const dividerStyle: React.CSSProperties = isCurrent
    ? { zIndex: 5, scrollMarginTop: "5.5rem", borderBottomColor: "var(--color-accent)", borderBottomWidth: 2 }
    : { zIndex: 5, scrollMarginTop: "5.5rem" };

  return (
    <div className={compact ? "py-2" : "py-4"}>
      <div ref={dividerRef} className={dividerClass} style={dividerStyle}>
        <span className={labelClass}>
          {formatDayShort(getDayKey(events[0]!.start_time))} · {formatHourLabel(hour)}
          {isCurrent && (
            <span className="ml-1.5 text-[0.625rem] font-600 uppercase tracking-widest text-accent/70">
              Now
            </span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" style={{ marginTop: "0.75rem" }}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isFavorite={favorites.has(event.id)}
            compact={compact}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
}
