import { Redirect } from "expo-router";

import { LoadingState } from "@/src/components/ui/LoadingState";
import { Screen } from "@/src/components/ui/Screen";
import { useAuthStore } from "@/src/hooks/useAuthStore";

export default function IndexScreen() {
  const { isHydrated, isAuthenticated } = useAuthStore();

  if (!isHydrated) {
    return (
      <Screen>
        <LoadingState message="Starting FieldOps..." />
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
