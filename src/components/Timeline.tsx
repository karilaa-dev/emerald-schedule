import type { ScheduleEvent } from "../types.ts";
import { groupByHour, groupByDayAndHour, formatDayLabel } from "../lib/dates.ts";
import { TimeSlot } from "./TimeSlot.tsx";

interface Props {
  events: ScheduleEvent[];
  favorites: Set<number>;
  allDays?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

function HourList({
  hours,
  favorites,
  onToggleFavorite,
  onSelectEvent,
}: {
  hours: Map<number, ScheduleEvent[]>;
  favorites: Set<number>;
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
          onToggleFavorite={onToggleFavorite}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}

export function Timeline({ events, favorites, allDays, onToggleFavorite, onSelectEvent }: Props) {
  if (events.length === 0) return null;

  if (!allDays) {
    return (
      <HourList
        hours={groupByHour(events)}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onSelectEvent={onSelectEvent}
      />
    );
  }

  return (
    <div>
      {groupByDayAndHour(events).map(({ day, hours }) => (
        <section key={day} className="mb-6">
          <div className="sticky top-[5.5rem] z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2 bg-surface/95 backdrop-blur-sm border-b border-border-light">
            <h2 className="font-display text-sm font-700 text-ink tracking-wide">
              {formatDayLabel(day)}
            </h2>
          </div>
          <HourList
            hours={hours}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectEvent={onSelectEvent}
          />
        </section>
      ))}
    </div>
  );
}
