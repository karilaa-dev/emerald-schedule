import type { ScheduleApiResponse } from "../types.ts";

export async function fetchSchedules(): Promise<ScheduleApiResponse> {
  const res = await fetch("/api/schedules");
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
}
