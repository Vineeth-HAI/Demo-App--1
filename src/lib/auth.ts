import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ApplicationVerifier,
  type ConfirmationResult,
  type User,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase";

export type SessionUser = {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
};

export function toSessionUser(user: User): SessionUser {
  return {
    uid: user.uid,
    email: user.email,
    phoneNumber: user.phoneNumber,
    displayName: user.displayName,
  };
}

function logAuth(action: string, details?: Record<string, unknown>): void {
  console.log(`[FirebaseAuth] ${action}`, details ?? "");
}

function logAuthError(action: string, error: unknown): void {
  const code = error instanceof FirebaseError ? error.code : "unknown";
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[FirebaseAuth] ${action} failed`, { code, message });
}

async function runAuth<T>(action: string, work: () => Promise<T>): Promise<T> {
  logAuth(action, { projectId: auth.app.options.projectId, authDomain: auth.app.options.authDomain });
  try {
    const result = await work();
    logAuth(`${action} succeeded`);
    return result;
  } catch (error) {
    logAuthError(action, error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<SessionUser> {
  return runAuth("signInWithEmail", async () => {
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return toSessionUser(credential.user);
  });
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string,
): Promise<SessionUser> {
  return runAuth("signUpWithEmail", async () => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );
    await updateProfile(credential.user, { displayName: fullName.trim() });
    return toSessionUser(credential.user);
  });
}

export async function requestPhoneOtp(
  phoneE164: string,
  appVerifier: ApplicationVerifier,
): Promise<ConfirmationResult> {
  return runAuth("requestPhoneOtp", async () => {
    return signInWithPhoneNumber(auth, phoneE164, appVerifier);
  });
}

export async function confirmPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
  displayName?: string,
): Promise<SessionUser> {
  return runAuth("confirmPhoneOtp", async () => {
    const credential = await confirmation.confirm(code.trim());
    const name = displayName?.trim();
    if (name && credential.user.displayName !== name) {
      await updateProfile(credential.user, { displayName: name });
    }
    return toSessionUser(credential.user);
  });
}

export async function signOutUser(): Promise<void> {
  return runAuth("signOut", async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
  });
}

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found for that email.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email or password is incorrect.";
      case "auth/email-already-in-use":
        return "An account already exists for that email.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";
      case "auth/invalid-phone-number":
        return "Enter a valid phone number.";
      case "auth/missing-phone-number":
        return "Enter your phone number.";
      case "auth/invalid-verification-code":
        return "That OTP is incorrect. Try again.";
      case "auth/code-expired":
      case "auth/session-expired":
        return "This OTP expired. Request a new code.";
      case "auth/missing-verification-code":
        return "Enter the 6-digit OTP.";
      case "auth/quota-exceeded":
        return "SMS quota exceeded. Try again later.";
      case "auth/captcha-check-failed":
        return "reCAPTCHA failed. Please try again.";
      case "auth/operation-not-allowed":
        if (error.message.toLowerCase().includes("region")) {
          return "SMS to this country is blocked. In Firebase Console open Authentication → Settings → SMS region policy, choose Allow, and add India (IN). Real SMS also needs the Blaze plan. For testing, add a test phone number under Authentication → Sign-in method → Phone.";
        }
        return "This sign-in method is not enabled in Firebase.";
      case "auth/configuration-not-found":
        return "Firebase Authentication is not set up for this project. In Firebase Console, open Authentication, click Get started, then enable Email/Password and Phone.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      case "auth/argument-error":
        return "Could not start phone verification. Try again.";
      default: {
        return error.message || "Authentication failed.";
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
