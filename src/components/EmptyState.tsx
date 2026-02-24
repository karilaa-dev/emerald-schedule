interface Props {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4 opacity-30">
        {hasFilters ? "\uD83D\uDD0D" : "\uD83D\uDCC5"}
      </div>
      <p className="font-display text-sm font-600 text-ink-muted">
        {hasFilters
          ? "No events match your filters"
          : "No events available yet"}
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Check back closer to the event"}
      </p>
      {hasFilters && (
        <button
          className="mt-4 rounded-full bg-accent-subtle px-4 py-2 text-xs font-600 text-accent hover:bg-accent-light transition-colors"
          onClick={onClear}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
