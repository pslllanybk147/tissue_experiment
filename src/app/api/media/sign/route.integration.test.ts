import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, getIdToken } from "firebase/auth";
import { readFileSync } from "node:fs";
import { POST } from "./route";

const emulatorEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
const suite = emulatorEnabled ? describe : describe.skip;

suite("media signing integration", () => {
  let testEnv: RulesTestEnvironment;
  let clientApp: ReturnType<typeof initializeApp>;
  let token = "";
  let uid = "";

  beforeAll(async () => {
    process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-philodendron-lab";
    process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
    process.env.CLOUDINARY_API_KEY = "demo-key";
    process.env.CLOUDINARY_API_SECRET = "demo-secret";
    testEnv = await initializeTestEnvironment({ projectId: "demo-philodendron-lab", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
    clientApp = initializeApp({ apiKey: "demo-api-key", authDomain: "demo-philodendron-lab.firebaseapp.com", projectId: "demo-philodendron-lab", appId: "demo-app" }, "upload-integration");
    const auth = getAuth(clientApp); connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    const user = await createUserWithEmailAndPassword(auth, "upload-owner@example.com", "password123");
    uid = user.user.uid;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await firestore.doc(`users/${uid}/lots/LOT-1`).set({ ownerId: uid, id: "LOT-1" });
      await firestore.doc(`users/${uid}/lots/LOT-1/observations/OBS-1`).set({ ownerId: uid, lotId: "LOT-1", id: "OBS-1" });
    });
    token = await getIdToken(user.user, true);
  });

  afterAll(async () => { await testEnv?.cleanup(); if (clientApp) await deleteApp(clientApp); });

  it("signs an upload for an existing Lot and Observation", async () => {
    const response = await POST(new Request("http://localhost/api/media/sign", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId: "LOT-1", observationId: "OBS-1", mimeType: "image/jpeg", bytes: 10 }) }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ cloudName: "demo-cloud", apiKey: "demo-key", folder: `users/${uid}/lots/LOT-1/observations/OBS-1` });
  }, 15000);

  it("rejects an upload target that does not exist", async () => {
    const response = await POST(new Request("http://localhost/api/media/sign", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId: "LOT-1", observationId: "OBS-NOT-REAL", mimeType: "image/jpeg", bytes: 10 }) }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Upload target not found" });
  });
});
