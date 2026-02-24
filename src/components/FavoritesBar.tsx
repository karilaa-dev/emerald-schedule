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
          ? "bg-favorite text-white"
          : "bg-surface-card text-ink border border-border shadow-lg"
      }`}
      onClick={onToggle}
    >
      <span className="text-base leading-none">{favoritesOnly ? "\u2605" : "\u2606"}</span>
      {favoritesOnly ? "Showing saved" : `${count} saved`}
    </button>
  );
}
