import { useState, useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocal(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(newValue), 300);
  };

  return (
    <div className="relative group">
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
        type="text"
        placeholder="Search events..."
        className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-8 text-sm text-ink placeholder-ink-faint outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 focus:bg-surface-card"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
      />
      {local && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-5 w-5 flex items-center justify-center bg-ink-faint/20 text-ink-muted hover:bg-ink-faint/40 transition-colors text-xs leading-none"
          onClick={() => handleChange("")}
        >
          &times;
        </button>
      )}
    </div>
  );
}
