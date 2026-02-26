interface Props {
  count: number;
  favoritesOnly: boolean;
  onToggle: () => void;
}

export function FavoritesBar({ count, favoritesOnly, onToggle }: Props) {
  if (count === 0 && !favoritesOnly) return null;

  return (
    <button
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-600 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
        favoritesOnly
          ? "bg-accent text-white"
          : "bg-surface-card text-ink border border-border shadow-lg"
      }`}
      onClick={onToggle}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" fill={favoritesOnly ? "currentColor" : "none"} />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" stroke={favoritesOnly ? "rgba(255,255,255,0.5)" : "currentColor"} />
      </svg>
      {favoritesOnly ? "My Schedule" : `My Schedule (${count})`}
    </button>
  );
}
