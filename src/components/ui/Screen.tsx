import { type PropsWithChildren, type ReactElement } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/src/constants/theme";

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  scroll?: boolean;
}>;

export function Screen({
  children,
  style,
  contentStyle,
  padded = true,
  scroll = false,
}: ScreenProps): ReactElement {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              padded ? styles.padded : null,
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={[styles.container, padded && styles.padded, contentStyle]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  padded: {
    padding: spacing.md,
  },
});
