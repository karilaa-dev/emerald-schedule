import { formatDayShort, formatDayDate } from "../lib/dates.ts";

interface Props {
  days: string[];
  activeDay: string | null;
  onSelectDay: (day: string | null) => void;
}

function tabClass(isActive: boolean): string {
  const base = "rounded-full px-3.5 py-1.5 font-display text-xs font-600 tracking-wide transition-colors duration-200";
  if (isActive) return `${base} bg-accent text-white shadow-sm`;
  return `${base} text-ink-muted hover:text-ink hover:bg-surface-warm`;
}

export function DayTabs({ days, activeDay, onSelectDay }: Props) {
  return (
    <div className="flex gap-1">
      <button
        className={tabClass(activeDay === null)}
        onClick={() => onSelectDay(null)}
      >
        All days
      </button>
      {days.map((day) => (
        <button
          key={day}
          className={tabClass(activeDay === day)}
          onClick={() => onSelectDay(day)}
        >
          <span className="sm:hidden">{formatDayShort(day)}</span>
          <span className="hidden sm:inline">{formatDayShort(day)} {formatDayDate(day)}</span>
        </button>
      ))}
    </div>
  );
}
