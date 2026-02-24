import { useState, useCallback } from "react";
import type { FilterState } from "../types.ts";

const DAY_KEY = "eccc-selected-day";

function getStoredDay(): string | null {
  const v = localStorage.getItem(DAY_KEY);
  return v === "all" ? null : v;
}

const initialState: FilterState = {
  day: getStoredDay(),
  categories: new Set(),
  tags: new Set(),
  locations: new Set(),
  search: "",
  favoritesOnly: false,
};

type SetField = "categories" | "tags" | "locations";

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const setDay = useCallback((day: string | null) => {
    localStorage.setItem(DAY_KEY, day ?? "all");
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

  const toggleCategory = useCallback((cat: string) => toggleSetItem("categories", cat), [toggleSetItem]);
  const toggleTag = useCallback((tag: string) => toggleSetItem("tags", tag), [toggleSetItem]);
  const toggleLocation = useCallback((loc: string) => toggleSetItem("locations", loc), [toggleSetItem]);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...initialState,
      day: prev.day,
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
    clearFilters,
    hasActiveFilters,
  };
}
