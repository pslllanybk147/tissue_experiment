import { describe, expect, it } from "vitest";

import { readFirebaseConfig } from "./config";

const completeEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-project",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456:web:abc",
};

describe("readFirebaseConfig", () => {
  it("returns a normalized config when every required variable exists", () => {
    expect(readFirebaseConfig(completeEnv)).toEqual({
      apiKey: "demo-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo.appspot.com",
      messagingSenderId: "123456",
      appId: "1:123456:web:abc",
    });
  });

  it("returns null when a required variable is missing", () => {
    expect(readFirebaseConfig({ ...completeEnv, NEXT_PUBLIC_FIREBASE_PROJECT_ID: "" })).toBeNull();
  });
});
