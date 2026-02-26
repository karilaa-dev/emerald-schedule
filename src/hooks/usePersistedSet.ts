import { useState, useCallback } from "react";

function loadSet(key: string): Set<number> {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export function usePersistedSet(storageKey: string) {
  const [items, setItems] = useState<Set<number>>(() => loadSet(storageKey));

  const toggle = useCallback((id: number) => {
    setItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }, [storageKey]);

  return { items, toggle };
}
