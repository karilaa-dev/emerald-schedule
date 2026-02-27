import { useMemo, useState, useEffect, useRef } from "react";
import type { ScheduleEvent } from "../types.ts";
import { groupByTime } from "../lib/dates.ts";
import { TimeSlot } from "./TimeSlot.tsx";

const INITIAL_BATCH = 4;
const BATCH_SIZE = 2;

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
  const allEntries = useMemo(() => [...timeGroups.entries()], [timeGroups]);

  // Progressive rendering: render initial batch on first load, expand via rAF
  const didInitRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(
    () => didInitRef.current ? allEntries.length : Math.min(INITIAL_BATCH, allEntries.length),
  );

  useEffect(() => {
    // After first load completes, render all immediately on subsequent updates
    if (didInitRef.current) {
      setVisibleCount(allEntries.length);
      return;
    }

    if (allEntries.length <= INITIAL_BATCH) {
      didInitRef.current = true;
      setVisibleCount(allEntries.length);
      return;
    }

    setVisibleCount(INITIAL_BATCH);
    let count = INITIAL_BATCH;
    let rafId: number;

    function addBatch() {
      count = Math.min(count + BATCH_SIZE, allEntries.length);
      setVisibleCount(count);
      if (count < allEntries.length) {
        rafId = requestAnimationFrame(addBatch);
      } else {
        didInitRef.current = true;
      }
    }

    rafId = requestAnimationFrame(addBatch);
    return () => cancelAnimationFrame(rafId);
  }, [allEntries]);

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

  const entries = allEntries.slice(0, visibleCount);

  return (
    <div>
      {entries.map(([time, timeEvents]) => (
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
