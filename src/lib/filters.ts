import type { ScheduleEvent, FilterState } from "../types.ts";
import { getDayKey } from "./dates.ts";

export function filterEvents(
  events: ScheduleEvent[],
  filters: FilterState,
  favorites: Set<number>,
  scheduled: Set<number>,
): ScheduleEvent[] {
  const includedCats = new Set<string>();
  const excludedCats = new Set<string>();
  for (const [cat, mode] of filters.categories) {
    if (mode === "include") includedCats.add(cat);
    else excludedCats.add(cat);
  }

  return events.filter((event) => {
    if (filters.myScheduleView && !scheduled.has(event.id)) return false;

    if (filters.day && getDayKey(event.start_time) !== filters.day) return false;

    if (includedCats.size > 0) {
      if (!event.schedule_categories.some((c) => includedCats.has(c.name))) return false;
    }

    if (excludedCats.size > 0) {
      if (event.schedule_categories.some((c) => excludedCats.has(c.name))) return false;
    }

    if (filters.tags.size > 0) {
      const hasMatch = event.schedule_tags.some((t) => filters.tags.has(t.tag));
      if (!hasMatch) return false;
    }

    if (filters.locations.size > 0) {
      const loc = event.venue_location?.name ?? event.location;
      if (!filters.locations.has(loc)) return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [
        event.title,
        event.description,
        event.people_list,
        event.location,
        ...event.schedule_tags.map((t) => t.tag),
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (filters.favoritesOnly && !favorites.has(event.id)) return false;

    return true;
  });
}

function collectUnique(events: ScheduleEvent[], extract: (e: ScheduleEvent) => string[]): string[] {
  const values = new Set<string>();
  for (const e of events) {
    for (const v of extract(e)) values.add(v);
  }
  return [...values].sort();
}

export function getUniqueCategories(events: ScheduleEvent[]): string[] {
  return collectUnique(events, (e) => e.schedule_categories.map((c) => c.name));
}

export function getUniqueTags(events: ScheduleEvent[]): string[] {
  return collectUnique(events, (e) => e.schedule_tags.map((t) => t.tag));
}

export function getUniqueLocations(events: ScheduleEvent[]): string[] {
  return collectUnique(events, (e) => {
    const loc = e.venue_location?.name ?? e.location;
    return loc ? [loc] : [];
  });
}
