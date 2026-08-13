import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";

import { colors, radii, spacing, typography } from "@/src/constants/theme";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  label,
  loading = false,
  variant = "primary",
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variantStyle(variant),
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}
      disabled={isDisabled}
      onPress={(event) => {
        if (!isDisabled) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={[styles.label, variant === "secondary" ? styles.secondaryLabel : null]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function variantStyle(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return styles.primary;
    case "secondary":
      return styles.secondary;
    case "danger":
      return styles.danger;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryMuted,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.button,
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: colors.primaryDark,
  },
});
