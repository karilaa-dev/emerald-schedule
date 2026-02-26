import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from "react";
import type { ScheduleEvent } from "./types.ts";
import { useSchedule } from "./hooks/useSchedule.ts";
import { useFavorites } from "./hooks/useFavorites.ts";
import { useMySchedule } from "./hooks/useMySchedule.ts";
import { useFilters } from "./hooks/useFilters.ts";
import { getUniqueDays, getDayKey, formatDayShort, formatDayDate } from "./lib/dates.ts";
import {
  filterEvents,
  getUniqueCategories,
  getUniqueTags,
  getUniqueLocations,
} from "./lib/filters.ts";
import { useOnlineStatus } from "./hooks/useOnlineStatus.ts";
import { useInstallPrompt } from "./hooks/useInstallPrompt.ts";
import { useTheme } from "./hooks/useTheme.ts";
import { useCompactMode } from "./hooks/useCompactMode.ts";
import { useCurrentHour } from "./hooks/useCurrentHour.ts";
import { DayTabs } from "./components/DayTabs.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { FilterPanel } from "./components/FilterPanel.tsx";
import { Timeline } from "./components/Timeline.tsx";
const EventDetail = lazy(() => import("./components/EventDetail.tsx"));
import { InfoModal } from "./components/InfoModal.tsx";
import { FavoritesBar } from "./components/FavoritesBar.tsx";
import { EmptyState } from "./components/EmptyState.tsx";
import { OfflineBanner } from "./components/OfflineBanner.tsx";
import { InstallTip } from "./components/InstallTip.tsx";
import { ScheduleFooter } from "./components/ScheduleFooter.tsx";

export function App() {
  const { events, loading, error, isStale, lastChecked, serverUpdatedAt, deviceUpdatedAt, checkNow, forceUpdate } = useSchedule();
  const isOnline = useOnlineStatus();
  const { visible: showInstallTip, install, dismiss: dismissInstallTip } = useInstallPrompt();
  const { theme, toggle: toggleTheme } = useTheme();
  const { compact, toggle: toggleCompact } = useCompactMode();
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { scheduled, toggle: toggleSchedule } = useMySchedule();
  const {
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
  } = useFilters();
  const currentTime = useCurrentHour();
  const [forceNow, setForceNow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const days = useMemo(() => getUniqueDays(events), [events]);
  const categories = useMemo(() => getUniqueCategories(events), [events]);
  const tags = useMemo(() => getUniqueTags(events), [events]);
  const locations = useMemo(() => getUniqueLocations(events), [events]);

  // Auto-select first day only on first visit (no stored preference)
  useEffect(() => {
    if (days.length === 0) return;

    const stored = localStorage.getItem("eccc-selected-day");

    // First visit: no stored preference → pick the first day
    if (stored === null) {
      setDay(days[0]!);
      return;
    }

    // User explicitly chose "All days" → respect it
    if (stored === "all") return;

    // Stored day no longer in schedule → reset to first day
    if (!days.includes(stored)) {
      setDay(days[0]!);
    }
  }, [days, setDay]);

  const filtered = useMemo(
    () => filterEvents(events, filters, favorites, scheduled),
    [events, filters, favorites, scheduled],
  );

  const activeCurrentHour = filters.day !== null && (forceNow || filters.day === currentTime.day)
    ? currentTime.hour
    : null;

  // Days that have at least one scheduled event (for My Schedule view)
  const scheduledDays = useMemo(() => {
    if (!filters.myScheduleView) return null;
    const daySet = new Set<string>();
    for (const event of events) {
      if (scheduled.has(event.id)) {
        daySet.add(getDayKey(event.start_time));
      }
    }
    return [...daySet].sort();
  }, [events, scheduled, filters.myScheduleView]);

  const effectiveDays = scheduledDays ?? days;

  // Auto-correct selected day when entering My Schedule if current day has no scheduled events
  useEffect(() => {
    if (!filters.myScheduleView || !scheduledDays) return;
    if (filters.day !== null && !scheduledDays.includes(filters.day)) {
      setDay(scheduledDays.length > 0 ? scheduledDays[0]! : null);
    }
  }, [filters.myScheduleView, scheduledDays, filters.day, setDay]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#event-") && events.length > 0) {
      const id = hash.slice(7);
      const event = events.find((e) => String(e.id) === id);
      if (event) {
        setSelectedEvent(event);
        const eventDay = getDayKey(event.start_time);
        if (filters.day !== eventDay) setDay(eventDay);
      }
    }
  }, [events]);

  const handleSelectEvent = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event);
    window.location.hash = `event-${event.id}`;
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEvent(null);
    history.replaceState(null, "", window.location.pathname);
  }, []);

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
              {filters.myScheduleView ? (
                <>
                  <h1 className="font-display text-xl font-800 tracking-tight text-ink">My</h1>
                  <span className="font-display text-xl font-800 tracking-tight text-accent">Schedule</span>
                </>
              ) : (
                <>
                  <h1 className="font-display text-xl font-800 tracking-tight text-ink">ECCC</h1>
                  <span className="font-display text-xl font-800 tracking-tight text-accent">'26</span>
                  <span className="font-display text-xl font-800 tracking-tight text-ink">Schedule</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="relative p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-warm transition-colors duration-150"
                onClick={() => setShowInfo(true)}
                aria-label="About this app"
                title="About this app"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <div className="pb-2 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <DayTabs days={effectiveDays} activeDay={filters.day} onSelectDay={setDay} />
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
            search={filters.search}
            onSearchChange={setSearch}
            toolbarButtons={
              <div className="flex items-center gap-1">
                <button
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-600 transition-all duration-200 ${
                    compact
                      ? "bg-accent-subtle text-accent"
                      : "text-ink-muted hover:bg-surface-warm hover:text-ink"
                  }`}
                  onClick={toggleCompact}
                  aria-label={compact ? "Expand cards" : "Compact cards"}
                  title={compact ? "Expand cards" : "Compact cards"}
                >
                  {compact ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )}
                  {compact ? "Compact" : "Default"}
                </button>
                {filters.day !== null && (
                  <button
                    className={`grid place-items-center rounded-full p-2 transition-all duration-200 ${
                      forceNow || filters.day === currentTime.day
                        ? "bg-accent-subtle text-accent"
                        : "text-ink-muted hover:bg-surface-warm hover:text-ink"
                    }`}
                    onClick={() => setForceNow((f) => !f)}
                    aria-label={forceNow ? "Disable now indicator" : "Show now indicator"}
                    title={forceNow ? "Disable now indicator" : "Show now indicator"}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    </svg>
                  </button>
                )}
              </div>
            }
            favoritesCount={favorites.size}
            favoritesOnly={filters.favoritesOnly}
            onToggleFavorites={toggleFavoritesOnly}
          />
        </div>

        {loading && (
          <div className="space-y-6 py-6">
            {["a", "b", "c", "d", "e"].map((row) => (
              <div key={row} className="flex gap-5">
                <div className="w-16 shrink-0 pt-1">
                  <div className="skeleton h-4 w-14 ml-auto" />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {["x", "y", "z"].map((col) => (
                    <div key={col} className="rounded-xl border border-border-light bg-surface-card p-4 space-y-3">
                      <div className="skeleton h-4 w-4/5" />
                      <div className="skeleton h-3 w-3/5" />
                      <div className="skeleton h-3 w-2/5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState hasFilters={hasActiveFilters} isMySchedule={filters.myScheduleView} onClear={clearFilters} />
        )}

        {!loading && filtered.length > 0 && (
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
          scheduled={scheduled}
          allDays={filters.day === null}
          compact={compact}
          currentHour={activeCurrentHour}
          onToggleSchedule={toggleSchedule}
          onSelectEvent={handleSelectEvent}
        />
      </main>

      <ScheduleFooter lastChecked={lastChecked} serverUpdatedAt={serverUpdatedAt} deviceUpdatedAt={deviceUpdatedAt} onCheck={checkNow} onForceUpdate={forceUpdate} />

      <FavoritesBar
        count={scheduled.size}
        favoritesOnly={filters.myScheduleView}
        onToggle={toggleMyScheduleView}
      />

      {selectedEvent && (
        <Suspense fallback={null}>
          <EventDetail
            event={selectedEvent}
            isFavorite={favorites.has(selectedEvent.id)}
            isScheduled={scheduled.has(selectedEvent.id)}
            onToggleFavorite={toggleFavorite}
            onToggleSchedule={toggleSchedule}
            onClose={handleCloseDetail}
          />
        </Suspense>
      )}

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
