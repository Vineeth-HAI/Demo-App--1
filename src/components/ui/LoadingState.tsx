import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/src/constants/theme";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  message: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 15,
  },
});
