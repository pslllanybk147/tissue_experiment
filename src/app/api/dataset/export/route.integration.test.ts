import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, getIdToken } from "firebase/auth";
import { readFileSync } from "node:fs";
import { POST } from "./route";

const emulatorEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
const suite = emulatorEnabled ? describe : describe.skip;

suite("dataset export integration", () => {
  let testEnv: RulesTestEnvironment;
  let clientApp: ReturnType<typeof initializeApp>;
  let token = "";
  let uid = "";

  beforeAll(async () => {
    process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-philodendron-lab";
    testEnv = await initializeTestEnvironment({ projectId: "demo-philodendron-lab", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
    clientApp = initializeApp({ apiKey: "demo-api-key", authDomain: "demo-philodendron-lab.firebaseapp.com", projectId: "demo-philodendron-lab", appId: "demo-app" }, "dataset-export-integration");
    const auth = getAuth(clientApp); connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    const user = await createUserWithEmailAndPassword(auth, "dataset-export-owner@example.com", "password123");
    uid = user.user.uid;
    await testEnv.withSecurityRulesDisabled(async context => {
      await context.firestore().doc(`users/${uid}/datasetItems/DATASET-1`).set({ id: "DATASET-1", ownerId: uid, mediaId: "MEDIA-1", lotId: "LOT-1", observationId: "OBS-1", assetUrl: "https://example.com/leaf.jpg", width: 1200, height: 900, format: "jpg", bytes: 200000, provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Approved", reviewedBy: "reviewer", reviewedAt: "2026-07-23T00:00:00.000Z", note: "checked" }, label: { scientificName: "Philodendron erubescens", cultivarName: "Pink Princess", confidence: "High", source: "expert", reviewedBy: "reviewer", reviewedAt: "2026-07-23T00:00:00.000Z", note: "checked" }, reviewStatus: "Approved", includedInTraining: true, createdAt: "2026-07-23T00:00:00.000Z", updatedAt: "2026-07-23T00:00:00.000Z" });
    });
    token = await getIdToken(user.user, true);
  });

  afterAll(async () => { await testEnv?.cleanup(); if (clientApp) await deleteApp(clientApp); });

  it("creates an export history record and returns the split manifest", async () => {
    const response = await POST(new Request("http://localhost/api/dataset/export", { method: "POST", headers: { authorization: `Bearer ${token}` } }));
    const body = await response.json();
    expect(response.status).toBe(201);
    expect(body).toMatchObject({ exportId: expect.any(String), schemaVersion: "image-dataset-v1", itemCount: 1, items: [expect.objectContaining({ id: "DATASET-1", split: "train" })] });
    await testEnv.withSecurityRulesDisabled(async context => {
      const exportRecord = await context.firestore().doc(`users/${uid}/datasetExports/${body.exportId}`).get();
      expect(exportRecord.exists).toBe(true);
      expect(exportRecord.data()).toMatchObject({ itemCount: 1, splitStrategy: "lot-hash-v1" });
    });
  }, 15000);
});
