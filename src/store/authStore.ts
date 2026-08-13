import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/src/lib/firebase";
import { toSessionUser, type SessionUser } from "@/src/lib/auth";

type AuthListener = () => void;

type AuthState = {
  user: SessionUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
};

let state: AuthState = {
  user: null,
  isHydrated: false,
  isAuthenticated: false,
};

const listeners = new Set<AuthListener>();
let unsubscribeAuth: (() => void) | null = null;

function emit(): void {
  listeners.forEach((listener) => listener());
}

function setState(partial: Partial<AuthState>): void {
  const next: AuthState = {
    ...state,
    ...partial,
  };

  if ("user" in partial) {
    next.isAuthenticated = partial.user != null;
  }

  state = next;
  emit();
}

export const authStore = {
  getState(): AuthState {
    return state;
  },
  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  hydrate(): void {
    if (unsubscribeAuth) {
      return;
    }

    unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? toSessionUser(firebaseUser) : null;
      setState({
        user,
        isHydrated: true,
        isAuthenticated: user != null,
      });
    });
  },
};
