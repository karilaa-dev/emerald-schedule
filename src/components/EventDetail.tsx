import { useEffect } from "react";
import type { ScheduleEvent } from "../types.ts";
import { formatTimeRange, formatDayLabel, getDayKey } from "../lib/dates.ts";
import { getCategoryColor } from "../lib/colors.ts";
import { decodeEntities } from "../lib/html.ts";

interface Props {
  event: ScheduleEvent;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
}

export function EventDetail({ event, isFavorite, onToggleFavorite, onClose }: Props) {
  const location = event.venue_location?.name ?? event.location;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="animate-backdrop absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-modal relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-surface-card/95 backdrop-blur-md px-5 py-3">
          <button
            className={`p-0.5 text-xl leading-none transition-all duration-200 ${
              isFavorite ? "text-favorite" : "text-border hover:text-favorite/60"
            }`}
            onClick={() => onToggleFavorite(event.id)}
            aria-label={isFavorite ? "Remove from saved" : "Save event"}
          >
            {isFavorite ? "\u2605" : "\u2606"}
          </button>
          <button
            className="rounded-full p-1.5 text-ink-faint hover:bg-surface-warm hover:text-ink transition-all"
            onClick={onClose}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <h2 className="font-display text-xl font-800 text-ink leading-snug tracking-tight">
            {decodeEntities(event.title)}
          </h2>

          {/* Meta info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2.5 text-ink-muted">
              <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-500">{formatDayLabel(getDayKey(event.start_time))}</span>
            </div>
            <div className="flex items-center gap-2.5 text-ink-muted">
              <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-500">{formatTimeRange(event.start_time, event.end_time)} PT</span>
            </div>
            {location && (
              <div className="flex items-center gap-2.5 text-ink-muted">
                <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-500">{location}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {event.schedule_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.schedule_categories.map((cat) => {
                const color = getCategoryColor(cat.name);
                return (
                  <span
                    key={cat.id}
                    className="rounded-full px-2.5 py-0.5 text-xs font-600"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {cat.name}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {event.schedule_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.schedule_tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-ink-muted font-500"
                >
                  {tag.tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div
              className="text-sm text-ink-muted leading-relaxed [&_a]:text-accent [&_a]:underline [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}

          {/* Panelists */}
          {event.people.length > 0 && (
            <div>
              <h3 className="font-display text-[10px] font-700 text-ink-faint uppercase tracking-[0.15em] mb-2">
                Panelists
              </h3>
              <div className="space-y-1">
                {event.people.map((person) => (
                  <div key={person.id} className="text-sm text-ink font-500">
                    {person.alt_name || `${person.first_name} ${person.last_name}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(event.video_link || event.bonus_link) && (
            <div className="flex gap-2 pt-1">
              {event.video_link && (
                <a
                  href={event.video_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent-subtle px-4 py-2 text-xs font-600 text-accent hover:bg-accent-light transition-colors"
                >
                  Watch Video
                </a>
              )}
              {event.bonus_link && (
                <a
                  href={event.bonus_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-surface-warm px-4 py-2 text-xs font-600 text-ink-muted hover:bg-border-light transition-colors"
                >
                  {event.bonus_link_text || "More Info"}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
