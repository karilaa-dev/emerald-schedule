interface Props {
  theme: "light" | "dark";
  onToggle: () => void;
}

const ICON_BASE = "h-4 w-4 transition-all duration-300";
const VISIBLE = "opacity-100 rotate-0 scale-100";
const HIDDEN = "opacity-0 scale-0 absolute inset-0 m-auto";

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      className="p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-warm transition-all duration-200"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <svg
        className={`${ICON_BASE} ${isDark ? `${HIDDEN} rotate-90` : VISIBLE}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg
        className={`${ICON_BASE} ${isDark ? VISIBLE : `${HIDDEN} -rotate-90`}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  );
}
