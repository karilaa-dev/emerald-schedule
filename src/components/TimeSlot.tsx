import type { ScheduleEvent } from "../types.ts";
import { formatHourLabel } from "../lib/dates.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  hour: number;
  events: ScheduleEvent[];
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function TimeSlot({ hour, events, favorites, onToggleFavorite, onSelectEvent }: Props) {
  return (
    <div className="flex gap-5 py-4">
      <div className="w-16 shrink-0 pt-1">
        <div className="sticky top-24 text-right">
          <span className="font-display text-xs font-700 text-ink-faint tracking-wide">
            {formatHourLabel(hour)}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-px bg-border-light mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              index={i}
              isFavorite={favorites.has(event.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
