import type { ScheduleEvent } from "../types.ts";
import { groupByHour, groupByDayAndHour } from "../lib/dates.ts";
import { TimeSlot } from "./TimeSlot.tsx";

interface Props {
  events: ScheduleEvent[];
  favorites: Set<number>;
  allDays?: boolean;
  compact?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

function HourList({
  hours,
  favorites,
  compact,
  onToggleFavorite,
  onSelectEvent,
}: {
  hours: Map<number, ScheduleEvent[]>;
  favorites: Set<number>;
  compact?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}) {
  return (
    <div className="divide-y divide-divider">
      {[...hours.entries()].map(([hour, hourEvents]) => (
        <TimeSlot
          key={hour}
          hour={hour}
          events={hourEvents}
          favorites={favorites}
          compact={compact}
          onToggleFavorite={onToggleFavorite}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}

export function Timeline({ events, favorites, allDays, compact, onToggleFavorite, onSelectEvent }: Props) {
  if (events.length === 0) return null;

  if (!allDays) {
    return (
      <HourList
        hours={groupByHour(events)}
        favorites={favorites}
        compact={compact}
        onToggleFavorite={onToggleFavorite}
        onSelectEvent={onSelectEvent}
      />
    );
  }

  return (
    <div>
      {groupByDayAndHour(events).map(({ day, hours }) => (
        <section key={day}>
          <HourList
            hours={hours}
            favorites={favorites}
            compact={compact}
            onToggleFavorite={onToggleFavorite}
            onSelectEvent={onSelectEvent}
          />
        </section>
      ))}
    </div>
  );
}
