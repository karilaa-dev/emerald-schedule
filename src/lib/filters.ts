import type { ScheduleEvent, FilterState } from "../types.ts";
import { getDayKey } from "./dates.ts";

export function filterEvents(
  events: ScheduleEvent[],
  filters: FilterState,
  favorites: Set<number>,
): ScheduleEvent[] {
  return events.filter((event) => {
    // Day filter
    if (filters.day && getDayKey(event.start_time) !== filters.day) return false;

    // Category filter
    if (filters.categories.size > 0) {
      const eventCats = event.schedule_categories.map((c) => c.name);
      if (!eventCats.some((c) => filters.categories.has(c))) return false;
    }

    // Tag filter
    if (filters.tags.size > 0) {
      const eventTags = event.schedule_tags.map((t) => t.tag);
      if (!eventTags.some((t) => filters.tags.has(t))) return false;
    }

    // Location filter
    if (filters.locations.size > 0) {
      const loc = event.venue_location?.name ?? event.location;
      if (!filters.locations.has(loc)) return false;
    }

    // Search filter
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

    // Favorites filter
    if (filters.favoritesOnly && !favorites.has(event.id)) return false;

    return true;
  });
}

/** Extract all unique categories from events */
export function getUniqueCategories(events: ScheduleEvent[]): string[] {
  const cats = new Set<string>();
  for (const e of events) {
    for (const c of e.schedule_categories) cats.add(c.name);
  }
  return [...cats].sort();
}

/** Extract all unique tags from events */
export function getUniqueTags(events: ScheduleEvent[]): string[] {
  const tags = new Set<string>();
  for (const e of events) {
    for (const t of e.schedule_tags) tags.add(t.tag);
  }
  return [...tags].sort();
}

/** Extract all unique locations from events */
export function getUniqueLocations(events: ScheduleEvent[]): string[] {
  const locs = new Set<string>();
  for (const e of events) {
    const loc = e.venue_location?.name ?? e.location;
    if (loc) locs.add(loc);
  }
  return [...locs].sort();
}
