import type { ScheduleApiResponse, PeopleApiResponse } from "../types.ts";

export async function fetchSchedules(): Promise<ScheduleApiResponse> {
  const res = await fetch("/api/schedules");
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
}

export async function fetchPeople(): Promise<PeopleApiResponse> {
  const res = await fetch("/api/people");
  if (!res.ok) throw new Error("Failed to fetch people");
  return res.json();
}
