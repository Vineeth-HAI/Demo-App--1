import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ConfirmationResult } from "firebase/auth";
import { z } from "zod";

import { AuthShell } from "@/src/components/auth/AuthShell";
import { ModeChip } from "@/src/components/auth/ModeChip";
import { PhoneNumberField } from "@/src/components/auth/PhoneNumberField";
import {
  RecaptchaVerifierModal,
  type RecaptchaVerifierHandle,
} from "@/src/components/auth/RecaptchaVerifierModal";
import { Button } from "@/src/components/ui/Button";
import { LoadingState } from "@/src/components/ui/LoadingState";
import { Motion } from "@/src/components/ui/Motion";
import { Screen } from "@/src/components/ui/Screen";
import { TextField } from "@/src/components/ui/TextField";
import { type AuthMethod, type PhoneStep, toE164Phone } from "@/src/constants/auth";
import { colors, fonts, spacing } from "@/src/constants/theme";
import { useAuthStore } from "@/src/hooks/useAuthStore";
import {
  confirmPhoneOtp,
  getFirebaseErrorMessage,
  requestPhoneOtp,
  signUpWithEmail,
} from "@/src/lib/auth";

const emailSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Use at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const phoneSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});

const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function SignupScreen() {
  const { isHydrated, isAuthenticated } = useAuthStore();
  const recaptchaRef = useRef<RecaptchaVerifierHandle>(null);
  const [method, setMethod] = useState<AuthMethod>("email");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("request");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const resetPhoneFlow = () => {
    setPhoneStep("request");
    setPendingPhone("");
    setPendingName("");
    setConfirmation(null);
    setError(null);
    otpForm.reset({ code: "" });
  };

  const switchMethod = (next: AuthMethod) => {
    switch (next) {
      case "email":
      case "phone":
        setMethod(next);
        resetPhoneFlow();
        return;
      default: {
        const _exhaustive: never = next;
        return _exhaustive;
      }
    }
  };

  const onEmailSignup = emailForm.handleSubmit(async (values) => {
    setBusy(true);
    setError(null);
    try {
      await signUpWithEmail(values.fullName, values.email, values.password);
      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  });

  const onRequestOtp = phoneForm.handleSubmit(async (values) => {
    const verifier = recaptchaRef.current;
    if (!verifier) {
      setError("Phone verification is not ready. Reload the app and try again.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const phone = toE164Phone(values.phone);
      const result = await requestPhoneOtp(phone, verifier);
      setPendingPhone(phone);
      setPendingName(values.fullName.trim());
      setConfirmation(result);
      setPhoneStep("verify");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  });

  const onVerifyOtp = otpForm.handleSubmit(async (values) => {
    if (!confirmation) {
      setError("Request a new OTP first.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await confirmPhoneOtp(confirmation, values.code, pendingName);
      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setBusy(false);
    }
  });

  if (!isHydrated) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <>
      <RecaptchaVerifierModal ref={recaptchaRef} />
      <AuthShell
        tagline="JOIN THE CREW"
        heroCopy="Create an account with email and password, or verify your phone with OTP."
        title="Create account"
      >
        <View style={styles.modeRow}>
          <ModeChip
            label="Email & password"
            active={method === "email"}
            onPress={() => switchMethod("email")}
          />
          <ModeChip
            label="Phone & OTP"
            active={method === "phone"}
            onPress={() => switchMethod("phone")}
          />
        </View>

        {renderSignupBody({
          method,
          phoneStep,
          emailForm,
          phoneForm,
          otpForm,
          showPassword,
          setShowPassword,
          pendingPhone,
          error,
          busy,
          onEmailSignup,
          onRequestOtp,
          onVerifyOtp,
          onChangePhone: resetPhoneFlow,
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="button">
              <Text style={styles.footerAction}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </AuthShell>
    </>
  );
}

type SignupBodyProps = {
  method: AuthMethod;
  phoneStep: PhoneStep;
  emailForm: ReturnType<typeof useForm<EmailFormValues>>;
  phoneForm: ReturnType<typeof useForm<PhoneFormValues>>;
  otpForm: ReturnType<typeof useForm<OtpFormValues>>;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  pendingPhone: string;
  error: string | null;
  busy: boolean;
  onEmailSignup: () => void;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  onChangePhone: () => void;
};

function renderSignupBody(props: SignupBodyProps) {
  switch (props.method) {
    case "email":
      return <EmailSignupForm {...props} />;
    case "phone":
      return renderPhoneBody(props);
    default: {
      const _exhaustive: never = props.method;
      return _exhaustive;
    }
  }
}

function renderPhoneBody(props: SignupBodyProps) {
  switch (props.phoneStep) {
    case "request":
      return <PhoneRequestForm {...props} />;
    case "verify":
      return <OtpForm {...props} />;
    default: {
      const _exhaustive: never = props.phoneStep;
      return _exhaustive;
    }
  }
}

function EmailSignupForm({
  emailForm,
  showPassword,
  setShowPassword,
  error,
  busy,
  onEmailSignup,
}: SignupBodyProps) {
  return (
    <Motion from="up" delay={160}>
      <View style={styles.form}>
        <Controller
          control={emailForm.control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              autoComplete="name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={emailForm.formState.errors.fullName?.message}
            />
          )}
        />
        <Controller
          control={emailForm.control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={emailForm.formState.errors.email?.message}
            />
          )}
        />
        <View>
          <Controller
            control={emailForm.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Create password"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={emailForm.formState.errors.password?.message}
              />
            )}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.showPassword}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? "Hide password" : "Show password"}
            </Text>
          </Pressable>
        </View>
        <Controller
          control={emailForm.control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Confirm password"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={emailForm.formState.errors.confirmPassword?.message}
            />
          )}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Sign up" loading={busy} onPress={onEmailSignup} />
      </View>
    </Motion>
  );
}

function PhoneRequestForm({
  phoneForm,
  error,
  busy,
  onRequestOtp,
}: SignupBodyProps) {
  return (
    <Motion from="up" delay={160}>
      <View style={styles.form}>
        <Text style={styles.subtitle}>We will send a 6-digit OTP to verify your number.</Text>
        <Controller
          control={phoneForm.control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              autoComplete="name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={phoneForm.formState.errors.fullName?.message}
            />
          )}
        />
        <PhoneNumberField
          control={phoneForm.control}
          name="phone"
          error={phoneForm.formState.errors.phone?.message}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Get OTP" loading={busy} onPress={onRequestOtp} />
      </View>
    </Motion>
  );
}

function OtpForm({
  otpForm,
  pendingPhone,
  error,
  busy,
  onVerifyOtp,
  onChangePhone,
}: SignupBodyProps) {
  return (
    <Motion from="up" delay={160}>
      <View style={styles.form}>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {pendingPhone}.</Text>
        <Controller
          control={otpForm.control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="OTP code"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={otpForm.formState.errors.code?.message}
            />
          )}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Verify & create account" loading={busy} onPress={onVerifyOtp} />
        <Button label="Change phone number" variant="secondary" onPress={onChangePhone} />
      </View>
    </Motion>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  showPassword: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  showPasswordText: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
    fontSize: 13,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
  },
  footerAction: {
    fontFamily: fonts.bodyBold,
    color: colors.primaryDark,
    fontSize: 14,
  },
});
