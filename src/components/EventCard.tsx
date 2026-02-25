import type { ScheduleEvent } from "../types.ts";
import { formatTimeRange } from "../lib/dates.ts";
import { getCategoryColor } from "../lib/colors.ts";
import { decodeEntities } from "../lib/html.ts";

interface Props {
  event: ScheduleEvent;
  isFavorite: boolean;
  compact?: boolean;
  onToggleFavorite: (id: number) => void;
  onSelect: (event: ScheduleEvent) => void;
}

export function EventCard({ event, isFavorite, compact, onToggleFavorite, onSelect }: Props) {
  const location = event.venue_location?.name ?? event.location;

  return (
    <article
      role="button"
      tabIndex={0}
      className="animate-card-in group flex overflow-hidden rounded-xl border border-border-light bg-surface-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/20"
      onClick={() => onSelect(event)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(event); } }}
    >
      <div className="flex-1 min-w-0 p-3.5">
        <h3 className="font-display text-sm font-700 leading-snug text-ink">
          {decodeEntities(event.title)}
        </h3>

        <div className="mt-0.5 flex flex-col text-[13px] text-ink-muted">
          <span className="font-500">{formatTimeRange(event.start_time, event.end_time)}</span>
          {location && (
            <span className="truncate text-ink-faint">{location}</span>
          )}
        </div>

        {!compact && event.people_list && (
          <p className="mt-0.5 text-[11px] text-ink-faint truncate italic">
            {event.people_list}
          </p>
        )}

        {!compact && event.schedule_categories.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {event.schedule_categories.map((cat) => {
              const color = getCategoryColor(cat.name);
              return (
                <span
                  key={cat.id}
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-600 tracking-wide"
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
        className={`flex w-10 shrink-0 items-center justify-center border-l transition-colors duration-150 ${
          isFavorite
            ? "border-favorite/20 text-favorite"
            : "border-border-light text-ink-faint hover:text-favorite hover:bg-surface-warm"
        }`}
        style={isFavorite ? { backgroundColor: "var(--color-favorite-subtle)" } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(event.id);
        }}
        aria-label={isFavorite ? "Remove from saved" : "Save event"}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      </button>
    </article>
  );
}
