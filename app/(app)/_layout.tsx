import { Redirect, Stack } from "expo-router";

import { LoadingState } from "@/src/components/ui/LoadingState";
import { Screen } from "@/src/components/ui/Screen";
import { colors } from "@/src/constants/theme";
import { useAuthStore } from "@/src/hooks/useAuthStore";

export default function AppLayout() {
  const { isHydrated, isAuthenticated } = useAuthStore();

  if (!isHydrated) {
    return (
      <Screen>
        <LoadingState message="Starting FieldOps..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
