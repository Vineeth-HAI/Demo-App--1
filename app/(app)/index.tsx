import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Screen } from "@/src/components/ui/Screen";
import { colors, fonts, radii, spacing, typography } from "@/src/constants/theme";
import { useAuthStore } from "@/src/hooks/useAuthStore";
import { getFirebaseErrorMessage, signOutUser } from "@/src/lib/auth";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOutUser();
      router.replace("/(auth)/login");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={styles.kicker}>SIGNED IN</Text>
        <Text style={styles.title}>Welcome{user?.displayName ? `, ${user.displayName}` : ""}</Text>
        <Text style={styles.copy}>You are authenticated with the FieldOps Firebase project.</Text>

        <View style={styles.card}>
          <InfoRow label="Name" value={user?.displayName ?? "—"} />
          <InfoRow label="Email" value={user?.email ?? "—"} />
          <InfoRow label="Phone" value={user?.phoneNumber ?? "—"} />
          <InfoRow label="UID" value={user?.uid ?? "—"} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign out" variant="danger" loading={busy} onPress={() => void onSignOut()} />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  copy: {
    ...typography.subtitle,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  rowValue: {
    fontFamily: fonts.body,
    color: colors.text,
    fontSize: 15,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 14,
  },
});
