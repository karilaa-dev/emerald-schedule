import { useState, useEffect } from "react";
import type { ScheduleEvent } from "../types.ts";
import { fetchSchedules } from "../lib/api.ts";

const CACHE_KEY = "eccc-schedule-cache";

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSchedules()
      .then((data) => {
        if (cancelled) return;
        setEvents(data.schedules);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.schedules));
        } catch {}
      })
      .catch((err) => {
        if (cancelled) return;
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            setEvents(JSON.parse(cached));
            setIsStale(true);
            return;
          }
        } catch {}
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { events, loading, error, isStale };
}
