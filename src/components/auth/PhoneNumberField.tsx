import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { INDIA_COUNTRY_CODE } from "@/src/constants/auth";
import { colors, fonts, radii, spacing } from "@/src/constants/theme";

type PhoneNumberFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  error?: string;
};

export function PhoneNumberField<T extends FieldValues>({
  control,
  name,
  error,
}: PhoneNumberFieldProps<T>) {
  return (
    <View style={styles.phoneBlock}>
      <Text style={styles.phoneLabel}>Phone number</Text>
      <View style={[styles.phoneRow, error ? styles.phoneRowError : null]}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>{INDIA_COUNTRY_CODE}</Text>
        </View>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.phoneInput}
              keyboardType="number-pad"
              autoComplete="tel"
              placeholder="XXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              underlineColorAndroid="transparent"
              maxLength={10}
              value={value}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 10))}
            />
          )}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  phoneBlock: {
    gap: spacing.xs,
  },
  phoneLabel: {
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    fontSize: 14,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    minHeight: 50,
  },
  phoneRowError: {
    borderColor: colors.danger,
  },
  countryCode: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  countryCodeText: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 14,
  },
});
