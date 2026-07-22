import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

import { getPublicFirebaseConfig } from "./config";

export type FirebaseServices = { app: FirebaseApp; auth: Auth; firestore: Firestore };

let services: FirebaseServices | null = null;
let emulatorsConnected = false;

export function getFirebaseServices(): FirebaseServices | null {
  if (typeof window === "undefined") return null;
  if (services) return services;

  const config = getPublicFirebaseConfig();
  if (!config) return null;

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && !emulatorsConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
    emulatorsConnected = true;
  }

  services = { app, auth, firestore };
  return services;
}
