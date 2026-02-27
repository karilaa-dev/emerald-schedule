import { memo } from "react";
import type { ScheduleEvent } from "../types.ts";
import { formatTimeRange } from "../lib/dates.ts";
import { getCategoryColor } from "../lib/colors.ts";
import { decodeEntities } from "../lib/html.ts";

interface Props {
  event: ScheduleEvent;
  isScheduled: boolean;
  compact?: boolean;
  onToggleSchedule: (id: number) => void;
  onSelect: (event: ScheduleEvent) => void;
}

export const EventCard = memo(function EventCard({ event, isScheduled, compact, onToggleSchedule, onSelect }: Props) {
  const location = event.venue_location?.name ?? event.location;

  return (
    <article
      role="button"
      tabIndex={0}
      className="group flex overflow-hidden rounded-xl border border-border-light bg-surface-card cursor-pointer transition-[box-shadow,border-color,transform] duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/20"
      onClick={() => onSelect(event)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(event); } }}
    >
      <div className="flex-1 min-w-0 p-4">
        <h3 className="font-display text-base font-700 leading-snug text-ink">
          {decodeEntities(event.title)}
        </h3>

        <div className="mt-0.5 flex flex-col text-sm text-ink-muted">
          <span className="font-500">{formatTimeRange(event.start_time, event.end_time)}</span>
          {location && (
            <span className="truncate text-ink-faint">{location}</span>
          )}
        </div>

        {!compact && event.people_list && (
          <p className="mt-0.5 text-xs text-ink-faint truncate italic">
            {event.people_list}
          </p>
        )}

        {!compact && event.schedule_categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {event.schedule_categories.map((cat) => {
              const color = getCategoryColor(cat.name);
              return (
                <span
                  key={cat.id}
                  className="inline-block rounded-full px-2 py-0.5 text-[11px] font-600 tracking-wide"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {cat.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <button
        className={`flex w-[60px] shrink-0 items-center justify-center border-l transition-colors duration-150 ${
          isScheduled
            ? "border-accent/20 text-accent"
            : "border-border-light text-ink-faint hover:text-accent hover:bg-surface-warm"
        }`}
        style={isScheduled ? { backgroundColor: "var(--color-accent-subtle)" } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSchedule(event.id);
        }}
        aria-label={isScheduled ? "Remove from schedule" : "Add to schedule"}
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" fill={isScheduled ? "currentColor" : "none"} />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" stroke={isScheduled ? "var(--color-accent-subtle, white)" : "currentColor"} />
          {isScheduled ? (
            <polyline points="9 16 11 18 15 14" stroke="var(--color-accent-subtle, white)" strokeWidth={2.5} fill="none" />
          ) : (
            <>
              <line x1="12" y1="14" x2="12" y2="18" strokeWidth={2.5} />
              <line x1="10" y1="16" x2="14" y2="16" strokeWidth={2.5} />
            </>
          )}
        </svg>
      </button>
    </article>
  );
});
