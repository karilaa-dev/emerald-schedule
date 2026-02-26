import { usePersistedSet } from "./usePersistedSet.ts";

export function useFavorites() {
  const { items: favorites, toggle } = usePersistedSet("eccc-favorites");
  return { favorites, toggle };
}
