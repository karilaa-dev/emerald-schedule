import { useState, useEffect, useRef, useCallback } from "react";
import type { ScheduleEvent } from "../types.ts";
import { fetchSchedules, fetchScheduleStatus, OfflineError } from "../lib/api.ts";

const CACHE_KEY = "eccc-schedule-cache";
const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes
const CHECK_RATE_LIMIT = 4;
const CHECK_RATE_WINDOW = 15_000; // 15 seconds
const FETCH_RATE_LIMIT = 4;
const FETCH_RATE_WINDOW = 60_000; // 1 minute

function makeRateLimiter(limit: number, window: number) {
  const timestamps: number[] = [];
  return {
    limited() {
      const now = Date.now();
      while (timestamps.length && now - timestamps[0]! >= window) timestamps.shift();
      return timestamps.length >= limit;
    },
    record() { timestamps.push(Date.now()); },
  };
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hashRef = useRef<string | null>(null);
  const checkRate = useRef(makeRateLimiter(CHECK_RATE_LIMIT, CHECK_RATE_WINDOW));
  const fetchRate = useRef(makeRateLimiter(FETCH_RATE_LIMIT, FETCH_RATE_WINDOW));

  const updateSchedule = useCallback(async () => {
    const now = Date.now();
    const data = await fetchSchedules();
    setEvents(data.schedules);
    setIsStale(false);
    setLastUpdated(now);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.schedules));
    } catch {}
  }, []);

  // Check for updates (only refetch if hash changed)
  const checkNow = useCallback(async () => {
    if (checkRate.current.limited()) return;
    checkRate.current.record();
    try {
      const status = await fetchScheduleStatus();
      const now = Date.now();
      setLastChecked(now);
      setIsStale(false);
      if (hashRef.current && status.hash !== hashRef.current) {
        if (!fetchRate.current.limited()) {
          fetchRate.current.record();
          await updateSchedule();
        }
      }
      hashRef.current = status.hash;
    } catch (err) {
      if (err instanceof OfflineError || err instanceof TypeError) setIsStale(true);
    }
  }, [updateSchedule]);

  // Force refetch regardless of hash
  const forceUpdate = useCallback(async () => {
    if (fetchRate.current.limited()) return;
    fetchRate.current.record();
    try {
      await updateSchedule();
      const status = await fetchScheduleStatus();
      hashRef.current = status.hash;
      setLastChecked(Date.now());
      setIsStale(false);
    } catch (err) {
      if (err instanceof OfflineError || err instanceof TypeError) setIsStale(true);
    }
  }, [updateSchedule]);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();

    fetchSchedules()
      .then((data) => {
        if (cancelled) return;
        setEvents(data.schedules);
        setLastUpdated(now);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.schedules));
        } catch {}
        return fetchScheduleStatus();
      })
      .then((status) => {
        if (cancelled || !status) return;
        hashRef.current = status.hash;
        setLastChecked(now);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const isOffline = err instanceof OfflineError || err instanceof TypeError;
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            setEvents(JSON.parse(cached));
            if (isOffline) setIsStale(true);
            return;
          }
        } catch {}
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Poll for updates every 15 minutes
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) checkNow();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [checkNow]);

  // Auto-check for updates when network reconnects
  useEffect(() => {
    const onReconnect = () => { checkNow(); };
    window.addEventListener("online", onReconnect);

    // Android: navigator.connection fires 'change' more reliably than online/offline
    const conn = (navigator as any).connection;
    const onConnectionChange = () => { if (navigator.onLine) checkNow(); };
    conn?.addEventListener("change", onConnectionChange);

    // Check when app returns to foreground (covers missed events while backgrounded)
    const onVisible = () => { if (!document.hidden && navigator.onLine) checkNow(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("online", onReconnect);
      conn?.removeEventListener("change", onConnectionChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkNow]);

  return { events, loading, error, isStale, lastChecked, lastUpdated, checkNow, forceUpdate };
}
