import { useState, useEffect, useRef, useCallback } from "react";
import type { ScheduleEvent } from "../types.ts";
import { fetchSchedules, fetchScheduleStatus, OfflineError } from "../lib/api.ts";

const CACHE_KEY = "eccc-schedule-cache";
const HASH_KEY = "eccc-schedule-hash";
const CACHED_AT_KEY = "eccc-schedule-cached-at";
const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes
const CHECK_RATE_LIMIT = 4;
const CHECK_RATE_WINDOW = 15_000; // 15 seconds
const FETCH_RATE_LIMIT = 4;
const FETCH_RATE_WINDOW = 60_000; // 1 minute

function isNetworkError(err: unknown): boolean {
  return err instanceof OfflineError || err instanceof TypeError;
}

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

  const updateSchedule = useCallback(async (hash: string) => {
    const data = await fetchSchedules(hash);
    setEvents(data.schedules);
    setIsStale(false);
    setLastUpdated(data.cachedAt);
    hashRef.current = data.hash;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.schedules));
      localStorage.setItem(HASH_KEY, data.hash);
      localStorage.setItem(CACHED_AT_KEY, String(data.cachedAt));
    } catch {}
  }, []);

  const checkNow = useCallback(async () => {
    if (checkRate.current.limited()) return;
    checkRate.current.record();
    try {
      const status = await fetchScheduleStatus(hashRef.current ?? undefined);
      setLastChecked(Date.now());
      setIsStale(false);
      if (status.changed && status.hash && !fetchRate.current.limited()) {
        fetchRate.current.record();
        await updateSchedule(status.hash);
      }
    } catch (err) {
      if (isNetworkError(err)) setIsStale(true);
    }
  }, [updateSchedule]);

  const forceUpdate = useCallback(async () => {
    if (fetchRate.current.limited()) return;
    fetchRate.current.record();
    try {
      const status = await fetchScheduleStatus();
      if (status.hash) await updateSchedule(status.hash);
      setLastChecked(Date.now());
      setIsStale(false);
    } catch (err) {
      if (isNetworkError(err)) setIsStale(true);
    }
  }, [updateSchedule]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const storedHash = localStorage.getItem(HASH_KEY);
        const status = await fetchScheduleStatus(storedHash ?? undefined);
        if (cancelled) return;
        setLastChecked(Date.now());

        if (status.changed && status.hash) {
          fetchRate.current.record();
          await updateSchedule(status.hash);
        } else {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            setEvents(JSON.parse(cached));
            hashRef.current = storedHash;
            const storedCachedAt = localStorage.getItem(CACHED_AT_KEY);
            if (storedCachedAt) setLastUpdated(Number(storedCachedAt));
          } else {
            // No localStorage but status said unchanged -- force fetch
            const fresh = await fetchScheduleStatus();
            if (cancelled) return;
            if (fresh.hash) {
              fetchRate.current.record();
              await updateSchedule(fresh.hash);
            }
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            setEvents(JSON.parse(cached));
            hashRef.current = localStorage.getItem(HASH_KEY);
            const storedCachedAt = localStorage.getItem(CACHED_AT_KEY);
            if (storedCachedAt) setLastUpdated(Number(storedCachedAt));
            if (isNetworkError(err)) setIsStale(true);
            return;
          }
        } catch {}
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [updateSchedule]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) checkNow();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [checkNow]);

  useEffect(() => {
    const onConnectionChange = () => { if (navigator.onLine) checkNow(); };
    const onVisible = () => { if (!document.hidden && navigator.onLine) checkNow(); };
    const conn = (navigator as any).connection;

    window.addEventListener("online", checkNow);
    conn?.addEventListener("change", onConnectionChange);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("online", checkNow);
      conn?.removeEventListener("change", onConnectionChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkNow]);

  return { events, loading, error, isStale, lastChecked, lastUpdated, checkNow, forceUpdate };
}
