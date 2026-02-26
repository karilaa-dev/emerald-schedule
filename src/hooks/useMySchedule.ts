import { useState, useCallback } from "react";

const STORAGE_KEY = "eccc-my-schedule";

function loadScheduled(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useMySchedule() {
  const [scheduled, setScheduled] = useState<Set<number>>(loadScheduled);

  const toggle = useCallback((eventId: number) => {
    setScheduled((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { scheduled, toggle, count: scheduled.size };
}
