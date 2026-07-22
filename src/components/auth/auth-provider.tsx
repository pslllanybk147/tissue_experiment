"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

import { getFirebaseServices } from "@/lib/firebase/client";
import { authSessionReducer, initialAuthSession, type AuthSession } from "./auth-session";

type AuthContextValue = { session: AuthSession; signIn: () => Promise<void>; signOut: () => Promise<void>; useDemo: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(authSessionReducer, initialAuthSession);

  useEffect(() => {
    const fallback = window.setTimeout(() => dispatch({ type: "UNCONFIGURED" }), 1_500);

    try {
      const services = getFirebaseServices();
      if (!services) {
        window.clearTimeout(fallback);
        dispatch({ type: "UNCONFIGURED" });
        return;
      }

      const unsubscribe = onAuthStateChanged(services.auth, (user) => {
        window.clearTimeout(fallback);
        if (!user) return dispatch({ type: "SIGNED_OUT" });
        dispatch({ type: "AUTHENTICATED", user: { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } });
      }, () => {
        window.clearTimeout(fallback);
        dispatch({ type: "SIGNED_OUT" });
      });

      return () => {
        window.clearTimeout(fallback);
        unsubscribe();
      };
    } catch {
      window.clearTimeout(fallback);
      dispatch({ type: "UNCONFIGURED" });
    }
  }, []);

  async function signIn() {
    const services = getFirebaseServices();
    if (!services) return dispatch({ type: "UNCONFIGURED" });
    await signInWithPopup(services.auth, new GoogleAuthProvider());
  }

  async function signOut() {
    const services = getFirebaseServices();
    if (services && session.status === "authenticated") await firebaseSignOut(services.auth);
    dispatch(services ? { type: "SIGNED_OUT" } : { type: "UNCONFIGURED" });
  }

  return <AuthContext.Provider value={{ session, signIn, signOut, useDemo: () => dispatch({ type: "DEMO" }) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
