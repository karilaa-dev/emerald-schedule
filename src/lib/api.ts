import type { ScheduleApiResponse } from "../types.ts";

export class OfflineError extends Error {
  constructor() { super("Offline"); }
}

export async function fetchSchedules(): Promise<ScheduleApiResponse> {
  const res = await fetch("/api/schedules");
  if (!res.ok) throw new Error("Failed to fetch schedules");
  if (res.headers.get("X-SW-Cache")) throw new OfflineError();
  return res.json();
}

export interface ScheduleStatus {
  hash: string;
  cachedAt: number;
}

export async function fetchScheduleStatus(): Promise<ScheduleStatus> {
  const res = await fetch("/api/schedules/status");
  if (!res.ok) throw new Error("Failed to fetch schedule status");
  if (res.headers.get("X-SW-Cache")) throw new OfflineError();
  return res.json();
}
