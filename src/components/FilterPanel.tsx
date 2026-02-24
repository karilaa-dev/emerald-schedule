import { useState, type ReactNode } from "react";

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
  searchBar?: ReactNode;
  favoritesCount: number;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
}

const CHIP_BASE = "rounded-full px-2.5 py-1 text-xs font-500 transition-all duration-150";
const CHIP_ACTIVE = `${CHIP_BASE} bg-accent-light text-accent font-600 shadow-sm`;
const CHIP_INACTIVE = `${CHIP_BASE} bg-surface-warm text-ink-muted hover:bg-border-light hover:text-ink`;

function chipClass(isActive: boolean): string {
  return isActive ? CHIP_ACTIVE : CHIP_INACTIVE;
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h4 className="font-display text-[10px] font-700 text-ink-faint uppercase tracking-[0.15em] mb-2">
      {children}
    </h4>
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
    <div>
      <SectionHeading>{title}</SectionHeading>
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
    </div>
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
  searchBar,
  favoritesCount,
  favoritesOnly,
  onToggleFavorites,
}: Props) {
  const [open, setOpen] = useState(false);
  const count = activeCategories.size + activeTags.size + activeLocations.size;

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-600 transition-all duration-200 ${
            open || hasActiveFilters
              ? "bg-accent-subtle text-accent"
              : "text-ink-muted hover:bg-surface-warm hover:text-ink"
          }`}
          onClick={() => setOpen(!open)}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {count > 0 && (
            <span className="rounded-full bg-accent text-white text-[10px] font-700 px-1.5 py-0.5 leading-none min-w-[18px] text-center">
              {count}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            className="text-xs font-500 text-ink-faint hover:text-ink transition-colors"
            onClick={onClear}
          >
            Clear all
          </button>
        )}
        {searchBar && <div className="flex-1 max-w-xs">{searchBar}</div>}
      </div>

      {open && (
        <div className="mt-3 space-y-5 rounded-xl border border-border-light bg-surface-card p-5 shadow-sm">
          <div>
            <SectionHeading>Saved</SectionHeading>
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
        </div>
      )}
    </div>
  );
}
