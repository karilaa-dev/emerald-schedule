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
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill={favoritesOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
      {favoritesOnly ? "Showing saved" : `${count} saved`}
    </button>
  );
}
