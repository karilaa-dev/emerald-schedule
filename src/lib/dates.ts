import type { ScheduleEvent } from "../types.ts";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Parse "YYYY-MM-DD" into a local Date (midnight) */
function parseDayKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Parse "YYYY-MM-DD HH:MM:SS" as a local Date (times are Pacific, displayed as-is) */
function parseTime(timeStr: string): Date {
  const [datePart, timePart] = timeStr.split(" ");
  const [h, min, s] = (timePart ?? "00:00:00").split(":").map(Number);
  const date = parseDayKey(datePart!);
  date.setHours(h!, min, s);
  return date;
}

/** "2026-03-05 10:00:00" → "10:00 AM" */
function formatTime(timeStr: string): string {
  const date = parseTime(timeStr);
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** "2026-03-05 10:00:00" → "10:00 AM - 1:30 PM" */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** "2026-03-05 10:00:00" → "2026-03-05" */
export function getDayKey(timeStr: string): string {
  return timeStr.split(" ")[0]!;
}

/** "2026-03-05" -> "Thu, Mar 5" */
export function formatDayLabel(dayKey: string): string {
  const date = parseDayKey(dayKey);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

/** "2026-03-05" -> "Thu" */
export function formatDayShort(dayKey: string): string {
  return DAY_NAMES[parseDayKey(dayKey).getDay()]!;
}

/** "2026-03-05" -> "3/5" */
export function formatDayDate(dayKey: string): string {
  const date = parseDayKey(dayKey);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** Get the time key for grouping: "2026-03-05 10:15:00" → 615 (minutes from midnight) */
function getTimeKey(timeStr: string): number {
  const date = parseTime(timeStr);
  return date.getHours() * 60 + date.getMinutes();
}

/** Format time key for display: 615 → "10:15 AM" */
export function formatTimeLabel(timeKey: number): string {
  const h = Math.floor(timeKey / 60);
  const m = timeKey % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** Get sorted unique days from events */
export function getUniqueDays(events: ScheduleEvent[]): string[] {
  const days = new Set(events.map((e) => getDayKey(e.start_time)));
  return [...days].sort();
}

/** Group events by full start time (minute precision), sorted */
export function groupByTime(events: ScheduleEvent[]): Map<number, ScheduleEvent[]> {
  const groups = new Map<number, ScheduleEvent[]>();
  for (const event of events) {
    const key = getTimeKey(event.start_time);
    const group = groups.get(key) ?? [];
    group.push(event);
    groups.set(key, group);
  }
  // Sort events within each group alphabetically by title
  for (const group of groups.values()) {
    group.sort((a, b) => a.title.localeCompare(b.title));
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a - b));
}
