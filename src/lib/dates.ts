import type { ScheduleEvent } from "../types.ts";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Parse "YYYY-MM-DD HH:MM:SS" as a local Date (times are Pacific, displayed as-is) */
function parseTime(timeStr: string): Date {
  const [datePart, timePart] = timeStr.split(" ");
  const [y, m, d] = datePart!.split("-").map(Number);
  const [h, min, s] = (timePart ?? "00:00:00").split(":").map(Number);
  return new Date(y!, m! - 1, d!, h, min, s);
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

/** "2026-03-05" → "Thu, Mar 5" */
export function formatDayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

/** "2026-03-05" → "Thu" */
export function formatDayShort(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  return DAY_NAMES[date.getDay()]!;
}

/** "2026-03-05" → "3/5" */
export function formatDayDate(dayKey: string): string {
  const [, m, d] = dayKey.split("-").map(Number);
  return `${m}/${d}`;
}

/** Get the hour key for grouping: "2026-03-05 10:00:00" → "10" */
function getHourKey(timeStr: string): number {
  const date = parseTime(timeStr);
  return date.getHours();
}

/** Format hour for display: 10 → "10:00 AM" */
export function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${ampm}`;
}

/** Get sorted unique days from events */
export function getUniqueDays(events: ScheduleEvent[]): string[] {
  const days = new Set(events.map((e) => getDayKey(e.start_time)));
  return [...days].sort();
}

/** Group events by day, then by hour within each day */
export function groupByDayAndHour(
  events: ScheduleEvent[],
): { day: string; hours: Map<number, ScheduleEvent[]> }[] {
  const dayMap = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const day = getDayKey(event.start_time);
    const group = dayMap.get(day) ?? [];
    group.push(event);
    dayMap.set(day, group);
  }
  return [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayEvents]) => ({ day, hours: groupByHour(dayEvents) }));
}

/** Group events by hour, sorted */
export function groupByHour(events: ScheduleEvent[]): Map<number, ScheduleEvent[]> {
  const groups = new Map<number, ScheduleEvent[]>();
  for (const event of events) {
    const hour = getHourKey(event.start_time);
    const group = groups.get(hour) ?? [];
    group.push(event);
    groups.set(hour, group);
  }
  // Sort events within each group by start time
  for (const group of groups.values()) {
    group.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a - b));
}
