import { useState, useEffect } from "react";
import type { ScheduleEvent } from "../types.ts";
import { fetchSchedules } from "../lib/api.ts";

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSchedules()
      .then((data) => {
        if (!cancelled) setEvents(data.schedules);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { events, loading, error };
}
