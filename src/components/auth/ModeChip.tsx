import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radii } from "@/src/constants/theme";

type ModeChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function ModeChip({ label, active, onPress }: ModeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : null]}
      accessibilityRole="button"
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontFamily: fonts.bodyBold,
  },
});
