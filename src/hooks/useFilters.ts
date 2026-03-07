import { useState, useCallback } from "react";
import type { FilterState } from "../types.ts";

const DAY_KEY = "eccc-selected-day";
const FAVORITES_FILTER_KEY = "eccc-favorites-only";
const MY_SCHEDULE_VIEW_KEY = "eccc-my-schedule-view";

function getStoredDay(): string | null {
  return localStorage.getItem(DAY_KEY);
}

const initialState: FilterState = {
  day: getStoredDay(),
  categories: new Map([["Autographing", "exclude"], ["Photo Ops", "exclude"]]),
  tags: new Set(),
  locations: new Set(),
  search: "",
  favoritesOnly: localStorage.getItem(FAVORITES_FILTER_KEY) === "true",
  myScheduleView: localStorage.getItem(MY_SCHEDULE_VIEW_KEY) === "true",
};

type SetField = "categories" | "tags" | "locations";

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const setDay = useCallback((day: string) => {
    localStorage.setItem(DAY_KEY, day);
    setFilters((prev) => ({ ...prev, day }));
  }, []);

  const toggleSetItem = useCallback((field: SetField, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[field]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [field]: next };
    });
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => {
      const next = new Map(prev.categories);
      const current = next.get(cat);
      if (current === undefined) next.set(cat, "include");
      else if (current === "include") next.set(cat, "exclude");
      else next.delete(cat);
      return { ...prev, categories: next };
    });
  }, []);
  const toggleTag = useCallback((tag: string) => toggleSetItem("tags", tag), [toggleSetItem]);
  const toggleLocation = useCallback((loc: string) => toggleSetItem("locations", loc), [toggleSetItem]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setFilters((prev) => {
      const next = !prev.favoritesOnly;
      localStorage.setItem(FAVORITES_FILTER_KEY, String(next));
      return { ...prev, favoritesOnly: next };
    });
  }, []);

  const toggleMyScheduleView = useCallback(() => {
    setFilters((prev) => {
      const next = !prev.myScheduleView;
      localStorage.setItem(MY_SCHEDULE_VIEW_KEY, String(next));
      return { ...prev, myScheduleView: next };
    });
  }, []);

  const clearFilters = useCallback(() => {
    localStorage.removeItem(FAVORITES_FILTER_KEY);
    setFilters((prev) => ({
      ...initialState,
      day: prev.day,
      favoritesOnly: false,
      myScheduleView: prev.myScheduleView,
    }));
  }, []);

  const hasActiveFilters =
    filters.categories.size > 0 ||
    filters.tags.size > 0 ||
    filters.locations.size > 0 ||
    filters.search !== "" ||
    filters.favoritesOnly;

  return {
    filters,
    setDay,
    toggleCategory,
    toggleTag,
    toggleLocation,
    setSearch,
    toggleFavoritesOnly,
    toggleMyScheduleView,
    clearFilters,
    hasActiveFilters,
  };
}
