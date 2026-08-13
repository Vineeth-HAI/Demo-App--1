# Demo-App--1

Frontend-only React Native (Expo) app. There is **no backend**.

Sign up and sign in go straight to **Firebase Authentication** (`fieldops-47bbf`):
- Email + password
- Phone number + OTP

## Run

```bash
npm install
npx expo start --clear
```

Open in Expo Go (SDK 54), an emulator, or press `w` for web.

## Firebase setup

See [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) for console steps, env vars, SMS region policy, and auth workflows.

Copy `.env.example` to `.env` and fill in the Firebase web config.
