import type { ScheduleApiResponseWithMeta } from "../types.ts";

export class OfflineError extends Error {
  constructor() { super("Offline"); }
}

function apiUrl(path: string, hash?: string): string {
  if (!hash) return path;
  return `${path}?hash=${encodeURIComponent(hash)}`;
}

function assertOnline(res: Response): void {
  if (res.headers.get("X-SW-Cache")) throw new OfflineError();
}

interface StatusResponse {
  changed: boolean;
  hash?: string;
}

export async function fetchScheduleStatus(clientHash?: string): Promise<StatusResponse> {
  const res = await fetch(apiUrl("/api/schedules/status", clientHash));
  if (!res.ok) throw new Error("Failed to fetch schedule status");
  assertOnline(res);
  return res.json();
}

export async function fetchSchedules(hash?: string): Promise<ScheduleApiResponseWithMeta> {
  const res = await fetch(apiUrl("/api/schedules", hash));

  if (res.status === 404) {
    const body = await res.json();
    if (body.currentHash) return fetchSchedules(body.currentHash);
    throw new Error("Schedule version not found");
  }

  if (!res.ok) throw new Error("Failed to fetch schedules");
  assertOnline(res);
  return res.json();
}
