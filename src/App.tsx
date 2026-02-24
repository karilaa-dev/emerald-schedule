import { useState, useMemo, useEffect, useRef } from "react";
import type { ScheduleEvent } from "./types.ts";
import { useSchedule } from "./hooks/useSchedule.ts";
import { useFavorites } from "./hooks/useFavorites.ts";
import { useFilters } from "./hooks/useFilters.ts";
import { getUniqueDays, formatDayShort, formatDayDate } from "./lib/dates.ts";
import {
  filterEvents,
  getUniqueCategories,
  getUniqueTags,
  getUniqueLocations,
} from "./lib/filters.ts";
import { useOnlineStatus } from "./hooks/useOnlineStatus.ts";
import { useInstallPrompt } from "./hooks/useInstallPrompt.ts";
import { DayTabs } from "./components/DayTabs.tsx";
import { SearchBar } from "./components/SearchBar.tsx";
import { FilterPanel } from "./components/FilterPanel.tsx";
import { Timeline } from "./components/Timeline.tsx";
import { EventDetail } from "./components/EventDetail.tsx";
import { FavoritesBar } from "./components/FavoritesBar.tsx";
import { EmptyState } from "./components/EmptyState.tsx";
import { OfflineBanner } from "./components/OfflineBanner.tsx";
import { InstallTip } from "./components/InstallTip.tsx";

export function App() {
  const { events, loading, error, isStale } = useSchedule();
  const isOnline = useOnlineStatus();
  const { visible: showInstallTip, install, dismiss: dismissInstallTip } = useInstallPrompt();
  const { favorites, toggle: toggleFavorite, count: favoriteCount } = useFavorites();
  const {
    filters,
    setDay,
    toggleCategory,
    toggleTag,
    toggleLocation,
    setSearch,
    toggleFavoritesOnly,
    clearFilters,
    hasActiveFilters,
  } = useFilters();
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const days = useMemo(() => getUniqueDays(events), [events]);
  const categories = useMemo(() => getUniqueCategories(events), [events]);
  const tags = useMemo(() => getUniqueTags(events), [events]);
  const locations = useMemo(() => getUniqueLocations(events), [events]);

  const didAutoSelect = useRef(false);
  useEffect(() => {
    if (days.length > 0 && filters.day === null && !didAutoSelect.current) {
      didAutoSelect.current = true;
      setDay(days[0]!);
    }
  }, [days, filters.day, setDay]);

  const filtered = useMemo(
    () => filterEvents(events, filters, favorites),
    [events, filters, favorites],
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#event-") && events.length > 0) {
      const id = Number(hash.slice(7));
      const event = events.find((e) => e.id === id);
      if (event) setSelectedEvent(event);
    }
  }, [events]);

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    window.location.hash = `event-${event.id}`;
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    history.replaceState(null, "", window.location.pathname);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center space-y-3">
          <p className="font-display text-lg font-bold text-ink">Something went wrong</p>
          <p className="text-sm text-ink-muted">Couldn't load the schedule</p>
          <button
            className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface-card/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-baseline gap-1.5 shrink-0">
              <h1 className="font-display text-xl font-800 tracking-tight text-ink">
                ECCC
              </h1>
              <span className="font-display text-xl font-800 tracking-tight text-accent">
                '26
              </span>
            </div>
            <div className="flex-1 max-w-xs">
              <SearchBar value={filters.search} onChange={setSearch} />
            </div>
          </div>
          <div className="pb-2 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <DayTabs days={days} activeDay={filters.day} onSelectDay={setDay} />
          </div>
        </div>
      </header>

      <InstallTip visible={showInstallTip} onInstall={install} onDismiss={dismissInstallTip} />
      <OfflineBanner visible={!isOnline || isStale} />

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-5">
        <div className="mb-5">
          <FilterPanel
            categories={categories}
            tags={tags}
            locations={locations}
            activeCategories={filters.categories}
            activeTags={filters.tags}
            activeLocations={filters.locations}
            onToggleCategory={toggleCategory}
            onToggleTag={toggleTag}
            onToggleLocation={toggleLocation}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {loading ? (
          <div className="space-y-6 py-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-16 shrink-0 pt-1">
                  <div className="skeleton h-4 w-14 ml-auto" />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="rounded-xl border border-border-light bg-surface-card p-4 space-y-3">
                      <div className="skeleton h-4 w-4/5" />
                      <div className="skeleton h-3 w-3/5" />
                      <div className="skeleton h-3 w-2/5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
        ) : (
          <p className="mb-3 font-display text-xs font-600 text-ink-faint uppercase tracking-widest">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {filters.search && filters.day && (
              <span className="normal-case tracking-normal">
                {" "}on {formatDayShort(filters.day)} {formatDayDate(filters.day)}
              </span>
            )}
          </p>
        )}

        <Timeline
          events={filtered}
          favorites={favorites}
          allDays={filters.day === null}
          onToggleFavorite={toggleFavorite}
          onSelectEvent={handleSelectEvent}
        />
      </main>

      <FavoritesBar
        count={favoriteCount}
        favoritesOnly={filters.favoritesOnly}
        onToggle={toggleFavoritesOnly}
      />

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isFavorite={favorites.has(selectedEvent.id)}
          onToggleFavorite={toggleFavorite}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
