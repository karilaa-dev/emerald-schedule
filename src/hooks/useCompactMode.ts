import { useState, useCallback } from "react";

const STORAGE_KEY = "eccc-compact";

export function useCompactMode() {
  const [compact, setCompact] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const toggle = useCallback(() => {
    setCompact((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { compact, toggle };
}
