import { useMemo } from "react";
import type { ScheduleEvent } from "../types.ts";
import { groupByTime } from "../lib/dates.ts";
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
  const timeGroups = useMemo(() => groupByTime(events), [events]);

  if (events.length === 0) return null;

  // Clamp currentHour to the available range: before first -> first, after last -> last
  let clampedHour = currentHour;
  if (clampedHour != null) {
    const keys = [...timeGroups.keys()];
    const firstHour = Math.floor(keys[0]! / 60);
    const lastHour = Math.floor(keys[keys.length - 1]! / 60);
    if (clampedHour < firstHour) clampedHour = firstHour;
    else if (clampedHour > lastHour) clampedHour = lastHour;
  }

  // Find the first time slot in the current hour (for scroll-to target)
  const currentTimeKey = clampedHour != null
    ? ([...timeGroups.keys()].find(k => Math.floor(k / 60) === clampedHour) ?? null)
    : null;

  return (
    <div>
      {[...timeGroups.entries()].map(([time, timeEvents]) => (
        <TimeSlot
          key={time}
          time={time}
          events={timeEvents}
          scheduled={scheduled}
          compact={compact}
          isCurrent={currentTimeKey === time}
          onToggleSchedule={onToggleSchedule}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </div>
  );
}
