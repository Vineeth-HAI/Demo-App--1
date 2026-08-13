import { useSyncExternalStore } from "react";

import { authStore } from "@/src/store/authStore";

export function useAuthStore() {
  return useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
}
