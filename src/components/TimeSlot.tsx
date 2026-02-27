import { useRef, useEffect, memo } from "react";
import type { ScheduleEvent } from "../types.ts";
import { formatTimeLabel } from "../lib/dates.ts";
import { EventCard } from "./EventCard.tsx";

interface Props {
  time: number;
  events: ScheduleEvent[];
  scheduled: Set<number>;
  compact?: boolean;
  isCurrent?: boolean;
  onToggleSchedule: (id: number) => void;
  onSelectEvent: (event: ScheduleEvent) => void;
}

export const TimeSlot = memo(function TimeSlot({ time, events, scheduled, compact, isCurrent, onToggleSchedule, onSelectEvent }: Props) {
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrent && dividerRef.current) {
      const el = dividerRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }, [isCurrent]);

  const baseDivider = "sticky top-0 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2 border-b";
  const dividerClass = isCurrent
    ? `${baseDivider} bg-accent-subtle`
    : `${baseDivider} bg-surface border-border-light`;

  const labelColor = isCurrent ? "text-accent" : "text-ink-faint";

  const dividerStyle: React.CSSProperties = {
    zIndex: 5,
    scrollMarginTop: "0",
    ...(isCurrent && { borderBottomColor: "var(--color-accent)", borderBottomWidth: 2 }),
  };

  return (
    <div className={compact ? "pb-2" : "pb-4"}>
      <div ref={dividerRef} className={dividerClass} style={dividerStyle}>
        <span className={`font-display text-sm font-700 tracking-wide ${labelColor}`}>
          {formatTimeLabel(time)}
          {isCurrent && (
            <span className="ml-1.5 text-[0.625rem] font-600 uppercase tracking-widest text-accent/70">
              Now
            </span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginTop: "1rem" }}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isScheduled={scheduled.has(event.id)}
            compact={compact}
            onToggleSchedule={onToggleSchedule}
            onSelect={onSelectEvent}
          />
        ))}
      </div>
    </div>
  );
});
