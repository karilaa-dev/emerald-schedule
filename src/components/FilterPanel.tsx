import { useState, useRef, useEffect, type ReactNode } from "react";

interface Props {
  categories: string[];
  tags: string[];
  locations: string[];
  activeCategories: Set<string>;
  activeTags: Set<string>;
  activeLocations: Set<string>;
  onToggleCategory: (cat: string) => void;
  onToggleTag: (tag: string) => void;
  onToggleLocation: (loc: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  toolbarButtons?: ReactNode;
  favoritesCount: number;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  myScheduleView: boolean;
  onToggleMyScheduleView: () => void;
}

const CHIP_BASE = "rounded-full px-3 py-1.5 text-sm font-500 transition-all duration-150";
const CHIP_ACTIVE = `${CHIP_BASE} bg-accent-light text-accent font-600 shadow-sm`;
const CHIP_INACTIVE = `${CHIP_BASE} bg-surface-warm text-ink-muted hover:bg-border-light hover:text-ink`;

function chipClass(isActive: boolean): string {
  return isActive ? CHIP_ACTIVE : CHIP_INACTIVE;
}

function CollapsibleSection({
  title,
  activeCount,
  children,
}: {
  title: string;
  activeCount?: number;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        className="flex w-full items-center justify-between gap-2 group"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-display text-xs font-700 text-ink-faint uppercase tracking-[0.15em] group-hover:text-ink-muted transition-colors">
          {title}
          {activeCount ? (
            <span className="ml-1.5 rounded-full bg-accent text-white text-[9px] font-700 px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          ) : null}
        </span>
        <svg
          className={`h-3 w-3 text-ink-faint shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  );
}

function FilterSection({
  title,
  items,
  active,
  onToggle,
}: {
  title: string;
  items: string[];
  active: Set<string>;
  onToggle: (item: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 6);
  const hasMore = items.length > 6;

  return (
    <CollapsibleSection title={title} activeCount={active.size}>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((item) => (
          <button
            key={item}
            className={chipClass(active.has(item))}
            onClick={() => onToggle(item)}
          >
            {item}
          </button>
        ))}
        {hasMore && (
          <button
            className="text-xs font-500 text-accent hover:underline px-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Less" : `+${items.length - 6}`}
          </button>
        )}
      </div>
    </CollapsibleSection>
  );
}

export function FilterPanel({
  categories,
  tags,
  locations,
  activeCategories,
  activeTags,
  activeLocations,
  onToggleCategory,
  onToggleTag,
  onToggleLocation,
  onClear,
  hasActiveFilters,
  search,
  onSearchChange,
  toolbarButtons,
  favoritesCount,
  favoritesOnly,
  onToggleFavorites,
  myScheduleView,
  onToggleMyScheduleView,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const count = activeCategories.size + activeTags.size + activeLocations.size;

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <div>
      <div className="flex items-center justify-center gap-1">
        <button
          className={`grid place-items-center rounded-full p-2 transition-all duration-200 ${
            myScheduleView
              ? "bg-accent-subtle text-accent"
              : "text-ink-muted hover:bg-surface-warm hover:text-ink"
          }`}
          onClick={onToggleMyScheduleView}
          aria-label={myScheduleView ? "Exit My Schedule" : "My Schedule"}
          title={myScheduleView ? "Exit My Schedule" : "My Schedule"}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" fill={myScheduleView ? "currentColor" : "none"} />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" stroke={myScheduleView ? "var(--color-accent-subtle)" : "currentColor"} />
          </svg>
        </button>
        <button
          className={`grid place-items-center rounded-full p-2 transition-all duration-200 ${
            favoritesOnly
              ? "text-favorite"
              : "text-ink-muted hover:bg-surface-warm hover:text-ink"
          }`}
          style={favoritesOnly ? { backgroundColor: "var(--color-favorite-subtle)" } : undefined}
          onClick={onToggleFavorites}
          aria-label={favoritesOnly ? "Show all events" : "Show saved only"}
          title={favoritesOnly ? "Show all events" : "Show saved only"}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill={favoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
        <button
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-600 transition-all duration-200 ${
            open || hasActiveFilters
              ? "bg-accent-subtle text-accent"
              : "text-ink-muted hover:bg-surface-warm hover:text-ink"
          }`}
          onClick={() => setOpen(!open)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {count > 0 && (
            <span className="rounded-full bg-accent text-white text-[10px] font-700 px-1.5 py-0.5 leading-none min-w-[18px] text-center">
              {count}
            </span>
          )}
        </button>
        <button
          className={`grid place-items-center rounded-full p-2 transition-all duration-200 ${
            searchOpen || search
              ? "bg-accent-subtle text-accent"
              : "text-ink-muted hover:bg-surface-warm hover:text-ink"
          }`}
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search events"
          title="Search events"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {toolbarButtons}
      </div>

      {searchOpen && (
        <div className="mt-2 flex items-center gap-2">
          <div className="relative group flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint transition-colors group-focus-within:text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events..."
              className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-8 text-base text-ink placeholder-ink-faint outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-surface-card"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onSearchChange("");
                  setSearchOpen(false);
                }
              }}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-5 w-5 flex items-center justify-center bg-ink-faint/20 text-ink-muted hover:bg-ink-faint/40 transition-colors text-xs leading-none"
                onClick={() => onSearchChange("")}
              >
                &times;
              </button>
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-border-light bg-surface-card px-5 py-4 shadow-sm max-h-[60vh] overflow-y-auto">
          <div>
            <button className={`${chipClass(favoritesOnly)} inline-flex items-center gap-1`} onClick={onToggleFavorites}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill={favoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              {favoritesCount} saved
            </button>
          </div>
          {categories.length > 0 && (
            <FilterSection title="Categories" items={categories} active={activeCategories} onToggle={onToggleCategory} />
          )}
          {tags.length > 0 && (
            <FilterSection title="Tags" items={tags} active={activeTags} onToggle={onToggleTag} />
          )}
          {locations.length > 0 && (
            <FilterSection title="Locations" items={locations} active={activeLocations} onToggle={onToggleLocation} />
          )}
          {hasActiveFilters && (
            <button
              className="text-xs font-500 text-ink-faint hover:text-ink transition-colors pt-1"
              onClick={onClear}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
