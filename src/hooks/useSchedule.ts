import { useState, useEffect, useRef, useCallback } from "react";
import type { ScheduleEvent } from "../types.ts";
import { fetchSchedules, fetchScheduleStatus, OfflineError } from "../lib/api.ts";

const CACHE_KEY = "eccc-schedule-cache";
const HASH_KEY = "eccc-schedule-hash";
const CACHED_AT_KEY = "eccc-schedule-cached-at";
const DEVICE_UPDATED_KEY = "eccc-schedule-device-updated";
const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes

function isNetworkError(err: unknown): boolean {
  return err instanceof OfflineError || err instanceof TypeError;
}

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<number | null>(null);
  const [deviceUpdatedAt, setDeviceUpdatedAt] = useState<number | null>(null);
  const hashRef = useRef<string | null>(null);

  const updateSchedule = useCallback(async (hash?: string) => {
    const data = await fetchSchedules(hash);
    setEvents(data.schedules);
    setIsStale(false);
    const now = Date.now();
    setServerUpdatedAt(data.cachedAt);
    setDeviceUpdatedAt(now);
    hashRef.current = data.hash;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.schedules));
      localStorage.setItem(HASH_KEY, data.hash);
      localStorage.setItem(CACHED_AT_KEY, String(data.cachedAt));
      localStorage.setItem(DEVICE_UPDATED_KEY, String(now));
    } catch {}
  }, []);

  const checkNow = useCallback(async () => {
    try {
      const status = await fetchScheduleStatus(hashRef.current ?? undefined);
      setLastChecked(Date.now());
      setIsStale(false);
      if (status.changed && status.hash) {
        await updateSchedule(status.hash);
      }
    } catch (err) {
      if (isNetworkError(err)) setIsStale(true);
    }
  }, [updateSchedule]);

  const forceUpdate = useCallback(async () => {
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
        const cached = localStorage.getItem(CACHE_KEY);

        if (!storedHash || !cached) {
          // First visit or no cache — fetch directly, skip status check
          await updateSchedule();
          if (cancelled) return;
          setLastChecked(Date.now());
        } else {
          // Returning user — check if data changed
          const status = await fetchScheduleStatus(storedHash);
          if (cancelled) return;
          setLastChecked(Date.now());

          if (status.changed && status.hash) {
            await updateSchedule(status.hash);
          } else {
            setEvents(JSON.parse(cached));
            hashRef.current = storedHash;
            const storedCachedAt = localStorage.getItem(CACHED_AT_KEY);
            if (storedCachedAt) setServerUpdatedAt(Number(storedCachedAt));
            const storedDeviceUpdated = localStorage.getItem(DEVICE_UPDATED_KEY);
            if (storedDeviceUpdated) setDeviceUpdatedAt(Number(storedDeviceUpdated));
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
            if (storedCachedAt) setServerUpdatedAt(Number(storedCachedAt));
            const storedDeviceUpdated = localStorage.getItem(DEVICE_UPDATED_KEY);
            if (storedDeviceUpdated) setDeviceUpdatedAt(Number(storedDeviceUpdated));
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

  return { events, loading, error, isStale, lastChecked, serverUpdatedAt, deviceUpdatedAt, checkNow, forceUpdate };
}
