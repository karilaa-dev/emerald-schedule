import { formatDayShort, formatDayDate } from "../lib/dates.ts";

interface Props {
  days: string[];
  activeDay: string | null;
  onSelectDay: (day: string | null) => void;
}

export function DayTabs({ days, activeDay, onSelectDay }: Props) {
  return (
    <div className="flex gap-1">
      <button
        className={`rounded-full px-3.5 py-1.5 font-display text-xs font-600 tracking-wide transition-all duration-200 ${
          activeDay === null
            ? "bg-accent text-white shadow-sm"
            : "text-ink-muted hover:text-ink hover:bg-surface-warm"
        }`}
        onClick={() => onSelectDay(null)}
      >
        All days
      </button>
      {days.map((day) => (
        <button
          key={day}
          className={`rounded-full px-3.5 py-1.5 font-display text-xs font-600 tracking-wide transition-all duration-200 ${
            activeDay === day
              ? "bg-accent text-white shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-surface-warm"
          }`}
          onClick={() => onSelectDay(day)}
        >
          <span className="sm:hidden">{formatDayShort(day)}</span>
          <span className="hidden sm:inline">{formatDayShort(day)} {formatDayDate(day)}</span>
        </button>
      ))}
    </div>
  );
}
