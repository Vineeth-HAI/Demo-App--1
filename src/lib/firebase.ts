import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { assertFirebaseConfig, firebaseConfig } from "@/src/lib/firebaseConfig";

assertFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

console.log("[FirebaseAuth] initialized", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: Boolean(firebaseConfig.apiKey),
  hasAppId: Boolean(firebaseConfig.appId),
});
