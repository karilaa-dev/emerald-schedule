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
    <div
      className="animate-card-in group relative rounded-xl border border-border-light bg-surface-card p-3.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/20"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      onClick={() => onSelect(event)}
    >
      <button
        className={`absolute top-3 right-3 p-0.5 text-base leading-none transition-all duration-200 ${
          isFavorite
            ? "text-favorite scale-110"
            : "text-border opacity-0 group-hover:opacity-100 hover:text-favorite/60"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(event.id);
        }}
        aria-label={isFavorite ? "Remove from saved" : "Save event"}
      >
        {isFavorite ? "\u2605" : "\u2606"}
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
    </div>
  );
}
