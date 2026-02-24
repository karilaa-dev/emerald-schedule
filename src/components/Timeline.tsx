import type { ScheduleEvent } from "../types.ts";
import { groupByHour } from "../lib/dates.ts";
import { TimeSlot } from "./TimeSlot.tsx";

interface Props {
  events: ScheduleEvent[];
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function Timeline({ events, favorites, onToggleFavorite, onSelectEvent }: Props) {
  const grouped = groupByHour(events);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-zinc-100">
      {[...grouped.entries()].map(([hour, hourEvents]) => (
        <TimeSlot
          key={hour}
          hour={hour}
          events={hourEvents}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}
