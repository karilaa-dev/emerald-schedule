import { useState, useCallback } from "react";
import type { FilterState } from "../types.ts";

const initialState: FilterState = {
  day: null,
  categories: new Set(),
  tags: new Set(),
  locations: new Set(),
  search: "",
  favoritesOnly: false,
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialState);

  const setDay = useCallback((day: string | null) => {
    setFilters((prev) => ({ ...prev, day }));
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => {
      const next = new Set(prev.categories);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...prev, categories: next };
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => {
      const next = new Set(prev.tags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return { ...prev, tags: next };
    });
  }, []);

  const toggleLocation = useCallback((loc: string) => {
    setFilters((prev) => {
      const next = new Set(prev.locations);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return { ...prev, locations: next };
    });
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleFavoritesOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...initialState,
      day: prev.day, // keep day selection
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
