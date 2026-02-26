import { useMemo } from "react";
import type { ScheduleEvent } from "../types.ts";
import { groupByHour } from "../lib/dates.ts";
import { TimeSlot } from "./TimeSlot.tsx";

interface Props {
  events: ScheduleEvent[];
  scheduled: Set<number>;
  compact?: boolean;
  currentHour?: number | null;
  onToggleSchedule: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export function Timeline({ events, scheduled, compact, currentHour, onToggleSchedule, onSelectEvent }: Props) {
  const hours = useMemo(() => groupByHour(events), [events]);

  if (events.length === 0) return null;

  // Clamp currentHour to the available range: before first -> first, after last -> last
  let clampedHour = currentHour;
  if (clampedHour != null) {
    const keys = [...hours.keys()];
    const first = keys[0]!;
    const last = keys[keys.length - 1]!;
    if (clampedHour < first) clampedHour = first;
    else if (clampedHour > last) clampedHour = last;
  }

  return (
    <div className="divide-y divide-divider">
      {[...hours.entries()].map(([hour, hourEvents]) => (
        <TimeSlot
          key={hour}
          hour={hour}
          events={hourEvents}
          scheduled={scheduled}
          compact={compact}
          isCurrent={clampedHour === hour}
          onToggleSchedule={onToggleSchedule}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}
