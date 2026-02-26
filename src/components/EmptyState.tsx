interface Props {
  hasFilters: boolean;
  isMySchedule?: boolean;
  onClear: () => void;
}

function getContent(isMySchedule: boolean, hasFilters: boolean) {
  if (isMySchedule) {
    return {
      icon: "\uD83D\uDCC5",
      title: "No saved events",
      subtitle: "Tap any event to view details and add it to your schedule",
    };
  }
  if (hasFilters) {
    return {
      icon: "\uD83D\uDD0D",
      title: "No events match your filters",
      subtitle: "Try adjusting your search or filters",
    };
  }
  return {
    icon: "\uD83D\uDCC5",
    title: "No events available yet",
    subtitle: "Check back closer to the event",
  };
}

export function EmptyState({ hasFilters, isMySchedule = false, onClear }: Props) {
  const { icon, title, subtitle } = getContent(isMySchedule, hasFilters);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4 opacity-30">{icon}</div>
      <p className="font-display text-sm font-600 text-ink-muted">{title}</p>
      <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>
      {hasFilters && !isMySchedule && (
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
