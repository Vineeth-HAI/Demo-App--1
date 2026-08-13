import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

import { assertFirebaseConfig, firebaseConfig } from "@/src/lib/firebaseConfig";

assertFirebaseConfig();

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();

console.log("[FirebaseAuth] initialized (native)", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: Boolean(firebaseConfig.apiKey),
  hasAppId: Boolean(firebaseConfig.appId),
});
