import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, getIdToken } from "firebase/auth";
import { readFileSync } from "node:fs";
import { POST } from "./route";

const emulatorEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
const suite = emulatorEnabled ? describe : describe.skip;

suite("dataset intake integration", () => {
  let testEnv: RulesTestEnvironment;
  let clientApp: ReturnType<typeof initializeApp>;
  let token = "";
  let uid = "";

  beforeAll(async () => {
    process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-philodendron-lab";
    testEnv = await initializeTestEnvironment({ projectId: "demo-philodendron-lab", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
    clientApp = initializeApp({ apiKey: "demo-api-key", authDomain: "demo-philodendron-lab.firebaseapp.com", projectId: "demo-philodendron-lab", appId: "demo-app" }, "dataset-intake-integration");
    const auth = getAuth(clientApp); connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    const user = await createUserWithEmailAndPassword(auth, "dataset-owner@example.com", "password123");
    uid = user.user.uid;
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await firestore.doc(`users/${uid}/lots/LOT-1`).set({ ownerId: uid, id: "LOT-1" });
      await firestore.doc(`users/${uid}/lots/LOT-1/observations/OBS-1`).set({ ownerId: uid, lotId: "LOT-1", id: "OBS-1" });
      await firestore.doc(`users/${uid}/lots/LOT-1/observations/OBS-1/media/MEDIA-1`).set({ ownerId: uid, lotId: "LOT-1", observationId: "OBS-1", secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg", deletedAt: null });
    });
    token = await getIdToken(user.user, true);
  });

  afterAll(async () => { await testEnv?.cleanup(); if (clientApp) await deleteApp(clientApp); });

  it("creates a pending dataset item from an existing media and is idempotent", async () => {
    const request = () => POST(new Request("http://localhost/api/dataset/intake", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId: "LOT-1", observationId: "OBS-1", mediaId: "MEDIA-1" }) }));
    const first = await request();
    expect(first.status).toBe(201);
    expect(await first.json()).toMatchObject({ created: true, item: { reviewStatus: "Pending review", includedInTraining: false, assetUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg" } });
    await testEnv.withSecurityRulesDisabled(async context => {
      const audit = await context.firestore().collection(`users/${uid}/lots/LOT-1/auditEvents`).get();
      expect(audit.docs.map(item => item.data())).toEqual(expect.arrayContaining([expect.objectContaining({ entityType: "media", entityId: "MEDIA-1", action: "dataset_queued" })]));
    });
    const second = await request();
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ created: false, item: { mediaId: "MEDIA-1" } });
  }, 15000);

  it("does not accept a media target from another observation", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/intake", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId: "LOT-1", observationId: "OBS-OTHER", mediaId: "MEDIA-1" }) }));
    expect(response.status).toBe(404);
  });
});
