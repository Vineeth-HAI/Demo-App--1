import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, fonts, radii, spacing } from "@/src/constants/theme";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        underlineColorAndroid="transparent"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    fontSize: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 13,
  },
});
