# FieldOps P2 — Firebase Authentication Setup

**Audience:** Team lead  
**Project:** Demo-App--1 (React Native frontend from P2)  

**Stack:** React Native (Expo SDK 54) + Firebase Auth only  
**Backend:** None. Sign up / sign in talk directly to Firebase.

---

## 1. What this app does

P2 is a mobile auth app with two screens:

| Screen | Options |
| --- | --- |
| Sign up | Email + password, or phone + OTP |
| Sign in | Email + password, or phone + OTP |

Users can switch between email and phone on both screens.

After a successful signup or sign-in, Firebase creates a session. The app listens with `onAuthStateChanged` and shows a home screen (uid, email, phone, display name) plus Sign out.

---

## 2. Firebase project

We reuse the **same Firebase project as P1** (not a new project).

| Field | Value |
| --- | --- |
| Project ID | `fieldops-47bbf` |
| Auth domain | `fieldops-47bbf.firebaseapp.com` |
| Console | https://console.firebase.google.com/project/fieldops-47bbf/overview |
| App type | Web app config (used by the Expo JS SDK) |

Client config lives in `.env` as `EXPO_PUBLIC_*` variables (copied from P1):

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBdffo1dYow_AguL56Ns_nnEALJaE4VQHU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=fieldops-47bbf.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=fieldops-47bbf
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=fieldops-47bbf.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1075066127486
EXPO_PUBLIC_FIREBASE_APP_ID=1:1075066127486:web:3de95b4fee6dc65d55c42f
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZXMCEVBB82
```

These are **public web-app keys** (same class of values that ship in a mobile/web client). They are not a service-account JSON. Do not treat them as a server secret, but do not rotate them without updating `.env`.

Loaded in code via `src/lib/firebaseConfig.ts` → `src/lib/firebase.ts` (web) / `src/lib/firebase.native.ts` (device, AsyncStorage persistence).

---

## 3. Console setup we completed / required

Open **Authentication** for the project:  
https://console.firebase.google.com/project/fieldops-47bbf/authentication

### 3.1 Enable Authentication

1. Authentication → **Get started** (if Auth was never initialized).
2. Without this, the app returns `auth/configuration-not-found`.

### 3.2 Enable sign-in providers

**Authentication → Sign-in method**

| Provider | Status needed | Notes |
| --- | --- | --- |
| Email/Password | **Enabled** | Native email/password (not “Email link”) |
| Phone | **Enabled** | Used for OTP |

Email signup and sign-in were verified working after this was enabled.

### 3.3 SMS region policy (required for phone OTP)

Firebase blocks SMS until the developer allows the country. India (`+91`) is used in the app.

**Error we hit:**

```
auth/operation-not-allowed
SMS unable to be sent until this region enabled by the app developer
```

**Fix:**

1. Authentication → **Settings**  
   https://console.firebase.google.com/project/fieldops-47bbf/authentication/settings
2. **SMS region policy**
3. Choose **Allow**
4. Add **India (IN)**
5. Save

New Firebase projects default to **no regions allowed**.

### 3.4 Billing (real SMS)

Firebase **Spark (free)** cannot send phone-auth SMS (changed Sep 2024). Real OTP SMS needs the **Blaze** plan.

For local testing without SMS or Blaze:

1. Authentication → Sign-in method → Phone
2. **Phone numbers for testing**
3. Add a number in E.164 form, e.g. `+911234567890`, plus a 6-digit code
4. Use that number in the app — Firebase accepts the test OTP and does not send an SMS

### 3.5 Authorized domains (web)

If running on web (`npm run web`), the domain must be allowed under Authentication → Settings → **Authorized domains**. `localhost` is usually already listed. `fieldops-47bbf.firebaseapp.com` is the default auth domain.

---

## 4. Auth workflows

### Email sign up

1. User enters name, email, password, confirm password.
2. App calls `createUserWithEmailAndPassword`.
3. Firebase creates the user **and** signs them in.
4. App sets display name with `updateProfile`.
5. `onAuthStateChanged` fires → home screen.

### Email sign in

1. User enters email + password.
2. App calls `signInWithEmailAndPassword`.
3. Session is created → home screen.

### Phone OTP (sign up and sign in)

Firebase uses **one** phone flow for both. Confirming OTP **creates** the user if new, or **signs in** if the number already exists.

1. App prefixes `+91` to the 10-digit number.
2. reCAPTCHA runs (anti-bot).
3. App calls `signInWithPhoneNumber`.
4. Firebase sends SMS (or accepts a test number).
5. User enters the 6-digit code → `confirmation.confirm(code)`.
6. On signup, display name is saved. Then home screen.

**Note:** An email account and a phone account are **separate Firebase users** unless we later **link** them. Signing up with email, then signing in with phone, creates a second uid.

### Session / sign out

- Device: session persisted with AsyncStorage (`initializeAuth` + `getReactNativePersistence`).
- Sign out calls Firebase `signOut`. Session clears and the app returns to login.

---

## 5. How to run

```bash
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** (SDK 54), or press `w` for web.

Auth logs in the Metro terminal are prefixed with `[FirebaseAuth]`.

---

## 6. Current verification status

| Flow | Result |
| --- | --- |
| Email sign up | Working |
| Email sign in | Working |
| Sign out | Working |
| Phone OTP | Blocked until SMS region **India (IN)** is allowed (and Blaze for real SMS). Use a **test phone number** to verify the UI without SMS. |

---

## 7. Key files

| File | Role |
| --- | --- |
| `.env` | Firebase web config |
| `src/lib/firebaseConfig.ts` | Reads env into Firebase config object |
| `src/lib/firebase.ts` / `firebase.native.ts` | Initializes Firebase Auth |
| `src/lib/auth.ts` | Email + phone Auth API wrappers and error messages |
| `app/(auth)/signup.tsx` | Sign up UI |
| `app/(auth)/login.tsx` | Sign in UI |
| `src/store/authStore.ts` | `onAuthStateChanged` session store |

---

## 8. Checklist for another environment

- [ ] Firebase project exists; Authentication Get started clicked
- [ ] Email/Password provider enabled
- [ ] Phone provider enabled
- [ ] SMS region policy allows **IN** (and any other countries we ship to)
- [ ] Blaze plan if we send real SMS
- [ ] Optional: test phone numbers for QA
- [ ] `.env` filled with that project’s web app config
- [ ] Expo SDK 54 / Expo Go 54 to run the app
