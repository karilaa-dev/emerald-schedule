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

export function Timeline({ events, favorites, allDays, onToggleFavorite, onSelectEvent }: Props) {
  if (events.length === 0) {
    return null;
  }

  if (allDays) {
    const days = groupByDayAndHour(events);
    return (
      <div>
        {days.map(({ day, hours }) => (
          <section key={day} className="mb-6">
            <div className="sticky top-[5.5rem] z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2 bg-surface/95 backdrop-blur-sm border-b border-border-light">
              <h2 className="font-display text-sm font-700 text-ink tracking-wide">
                {formatDayLabel(day)}
              </h2>
            </div>
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
          </section>
        ))}
      </div>
    );
  }

  const grouped = groupByHour(events);

  return (
    <div className="divide-y divide-divider">
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
