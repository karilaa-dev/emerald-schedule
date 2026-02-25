import type { ScheduleApiResponseWithMeta } from "../types.ts";

export class OfflineError extends Error {
  constructor() { super("Offline"); }
}

interface StatusResponse {
  changed: boolean;
  hash?: string;
}

export async function fetchScheduleStatus(clientHash?: string): Promise<StatusResponse> {
  const url = clientHash
    ? `/api/schedules/status?hash=${encodeURIComponent(clientHash)}`
    : "/api/schedules/status";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch schedule status");
  if (res.headers.get("X-SW-Cache")) throw new OfflineError();
  return res.json();
}

export async function fetchSchedules(hash?: string): Promise<ScheduleApiResponseWithMeta> {
  const url = hash
    ? `/api/schedules?hash=${encodeURIComponent(hash)}`
    : "/api/schedules";
  const res = await fetch(url);

  if (res.status === 404) {
    const body = await res.json();
    if (body.currentHash) {
      return fetchSchedules(body.currentHash);
    }
    throw new Error("Schedule version not found");
  }

  if (!res.ok) throw new Error("Failed to fetch schedules");
  if (res.headers.get("X-SW-Cache")) throw new OfflineError();
  return res.json();
}
