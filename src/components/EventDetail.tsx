import { useEffect, useRef } from "react";
import type { ScheduleEvent } from "../types.ts";
import { formatTimeRange, formatDayLabel, getDayKey } from "../lib/dates.ts";
import { getCategoryColor } from "../lib/colors.ts";
import { decodeEntities, linkifyHtml } from "../lib/html.ts";

interface Props {
  event: ScheduleEvent;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
}

export default function EventDetail({ event, isFavorite, onToggleFavorite, onClose }: Props) {
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
      <div role="presentation" className="animate-backdrop absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-modal relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-surface-card/95 backdrop-blur-md px-5 py-3">
          <button
            className="group grid place-items-center px-5 py-3"
            style={{ margin: "-12px 0 -12px -20px" }}
            onClick={() => onToggleFavorite(event.id)}
            aria-label={isFavorite ? "Remove from saved" : "Save event"}
          >
            <span
              className={`flex items-center justify-center rounded-full p-2 transition-colors duration-150 ${
                isFavorite
                  ? "text-favorite"
                  : "bg-surface-warm text-ink-faint group-hover:text-favorite"
              }`}
              style={isFavorite ? { backgroundColor: "var(--color-favorite-subtle)" } : undefined}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </span>
          </button>
          <button
            className="group grid place-items-center px-5 py-3"
            style={{ margin: "-12px -20px -12px 0" }}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="flex items-center justify-center rounded-full p-2 bg-surface-warm text-ink-faint group-hover:text-ink transition-colors duration-150">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
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
            <HtmlContent
              html={linkifyHtml(event.description)}
              className="text-sm text-ink-muted leading-relaxed whitespace-pre-line [&_a]:text-accent [&_a]:underline [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
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

function HtmlContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <div ref={ref} className={className} />;
}
