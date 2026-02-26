import { usePersistedSet } from "./usePersistedSet.ts";

export function useMySchedule() {
  const { items: scheduled, toggle } = usePersistedSet("eccc-my-schedule");
  return { scheduled, toggle };
}
