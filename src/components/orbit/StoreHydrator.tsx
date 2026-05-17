import { useEffect } from "react";
import { loadPersistedState } from "@/store/app-store";

export function StoreHydrator() {
  useEffect(() => {
    loadPersistedState();
  }, []);
  return null;
}
