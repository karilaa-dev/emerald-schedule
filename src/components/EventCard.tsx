import type { ScheduleEvent } from "../types.ts";
import { formatTimeRange } from "../lib/dates.ts";
import { getCategoryColor } from "../lib/colors.ts";
import { decodeEntities } from "../lib/html.ts";

interface Props {
  event: ScheduleEvent;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSelect: (event: ScheduleEvent) => void;
  index: number;
}

export function EventCard({ event, isFavorite, onToggleFavorite, onSelect, index }: Props) {
  const location = event.venue_location?.name ?? event.location;

  return (
    <article
      role="button"
      tabIndex={0}
      className="animate-card-in group relative rounded-xl border border-border-light bg-surface-card p-3.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/20"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      onClick={() => onSelect(event)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(event); } }}
    >
      <button
        className={`absolute top-2.5 right-2.5 flex items-center justify-center rounded-full p-1.5 transition-colors duration-150 ${
          isFavorite
            ? "text-favorite"
            : "bg-surface-warm text-ink-faint hover:text-favorite"
        }`}
        style={isFavorite ? { backgroundColor: "var(--color-favorite-subtle)" } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(event.id);
        }}
        aria-label={isFavorite ? "Remove from saved" : "Save event"}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      </button>

      <h3 className="pr-6 font-display text-[13px] font-700 leading-snug text-ink">
        {decodeEntities(event.title)}
      </h3>

      <div className="mt-2 flex flex-col gap-0.5 text-xs text-ink-muted">
        <span className="font-500">{formatTimeRange(event.start_time, event.end_time)}</span>
        {location && (
          <span className="truncate text-ink-faint">{location}</span>
        )}
      </div>

      {event.people_list && (
        <p className="mt-1.5 text-[11px] text-ink-faint truncate italic">
          {event.people_list}
        </p>
      )}

      {event.schedule_categories.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
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
    </article>
  );
}
