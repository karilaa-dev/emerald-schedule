import type { ScheduleEvent } from "../types.ts";
import { formatHourLabel, getDayKey, formatDayShort } from "../lib/dates.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  hour: number;
  events: ScheduleEvent[];
  favorites: Set<number>;
  compact?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function TimeSlot({ hour, events, favorites, compact, onToggleFavorite, onSelectEvent }: Props) {
  return (
    <div className={compact ? "py-2" : "py-4"}>
      <div className="sticky top-[5.5rem] -mx-4 px-4 sm:-mx-6 sm:px-6 py-1.5 bg-surface/95 backdrop-blur-sm border-b border-border-light" style={{ zIndex: 5 }}>
        <span className="font-display text-xs font-700 text-ink-faint tracking-wide">
          {formatDayShort(getDayKey(events[0]!.start_time))} · {formatHourLabel(hour)}
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
