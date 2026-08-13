import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { LoadingState } from "@/src/components/ui/LoadingState";
import { colors } from "@/src/constants/theme";
import { authStore } from "@/src/store/authStore";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    authStore.hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}>
        <LoadingState message="Loading FieldOps..." />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade_from_bottom",
        }}
      />
    </>
  );
}
