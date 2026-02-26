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

function HourList({
  hours,
  scheduled,
  compact,
  currentHour,
  onToggleSchedule,
  onSelectEvent,
}: {
  hours: Map<number, ScheduleEvent[]>;
  scheduled: Set<number>;
  compact?: boolean;
  currentHour?: number | null;
  onToggleSchedule: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}) {
  // Clamp currentHour to the available range: before first → first, after last → last
  let clampedHour = currentHour;
  if (clampedHour != null) {
    const keys = [...hours.keys()];
    if (clampedHour < keys[0]!) clampedHour = keys[0]!;
    else if (clampedHour > keys[keys.length - 1]!) clampedHour = keys[keys.length - 1]!;
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

export function Timeline({ events, scheduled, compact, currentHour, onToggleSchedule, onSelectEvent }: Props) {
  if (events.length === 0) return null;

  return (
    <HourList
      hours={groupByHour(events)}
      scheduled={scheduled}
      compact={compact}
      currentHour={currentHour}
      onToggleSchedule={onToggleSchedule}
      onSelectEvent={onSelectEvent}
    />
  );
}
