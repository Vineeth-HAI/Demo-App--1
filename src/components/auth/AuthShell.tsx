import { LinearGradient } from "expo-linear-gradient";
import { type PropsWithChildren, type ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Motion } from "@/src/components/ui/Motion";
import { Screen } from "@/src/components/ui/Screen";
import { colors, fonts, radii, spacing, typography } from "@/src/constants/theme";

type AuthShellProps = PropsWithChildren<{
  tagline: string;
  heroCopy: string;
  title: string;
}>;

export function AuthShell({ tagline, heroCopy, title, children }: AuthShellProps): ReactElement {
  return (
    <Screen scroll padded={false}>
      <LinearGradient
        colors={["#0A3D38", "#0F766E", "#E8F0ED"]}
        locations={[0, 0.38, 0.72]}
        style={styles.hero}
      >
        <Motion from="down" delay={40}>
          <Text style={styles.brand}>FieldOps</Text>
          <Text style={styles.tagline}>{tagline}</Text>
          <Text style={styles.heroCopy}>{heroCopy}</Text>
        </Motion>
      </LinearGradient>

      <View style={styles.sheet}>
        <Motion from="up" delay={100}>
          <Text style={styles.title}>{title}</Text>
        </Motion>
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  brand: {
    ...typography.brand,
    color: colors.onPrimary,
  },
  tagline: {
    marginTop: spacing.sm,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(244, 251, 249, 0.72)",
  },
  heroCopy: {
    marginTop: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(244, 251, 249, 0.9)",
    maxWidth: 320,
  },
  sheet: {
    marginTop: -spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    flexGrow: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
});
