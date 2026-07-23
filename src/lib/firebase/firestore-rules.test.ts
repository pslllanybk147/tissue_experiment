import { afterAll, beforeAll, describe, it } from "vitest";
import { initializeTestEnvironment, type RulesTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";

const rulesEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const suite = rulesEnabled ? describe : describe.skip;

suite("Firestore ownership rules", () => {
  let testEnv: RulesTestEnvironment;
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({ projectId: "demo-philodendron-lab", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
  });
  afterAll(async () => { await testEnv?.cleanup(); });

  it("allows an owner to create and read a Lot", async () => {
    const firestore = testEnv.authenticatedContext("owner-a").firestore();
    const ref = doc(firestore, "users/owner-a/lots/LOT-1");
    await assertSucceeds(setDoc(ref, { ownerId: "owner-a", id: "LOT-1" }));
    await assertSucceeds(getDoc(ref));
  });

  it("rejects unauthenticated and cross-user access", async () => {
    const owner = testEnv.authenticatedContext("owner-a").firestore();
    await setDoc(doc(owner, "users/owner-a/lots/LOT-2"), { ownerId: "owner-a", id: "LOT-2" });
    await assertFails(getDoc(doc(testEnv.unauthenticatedContext().firestore(), "users/owner-a/lots/LOT-2")));
    await assertFails(getDoc(doc(testEnv.authenticatedContext("owner-b").firestore(), "users/owner-a/lots/LOT-2")));
  });

  it("rejects a write that claims another owner", async () => {
    const firestore = testEnv.authenticatedContext("owner-a").firestore();
    await assertFails(setDoc(doc(firestore, "users/owner-a/plants/plant-1"), { ownerId: "owner-b", id: "plant-1" }));
  });

  it("allows owner-scoped dataset items and rejects cross-user access", async () => {
    const owner = testEnv.authenticatedContext("owner-a").firestore();
    const ref = doc(owner, "users/owner-a/datasetItems/dataset-1");
    await assertSucceeds(setDoc(ref, { ownerId: "owner-a", id: "dataset-1", reviewStatus: "Pending review", includedInTraining: false }));
    await assertSucceeds(getDoc(ref));
    await assertFails(getDoc(doc(testEnv.authenticatedContext("owner-b").firestore(), "users/owner-a/datasetItems/dataset-1")));
  });

  it("rejects an unauthenticated dataset write", async () => {
    await assertFails(setDoc(doc(testEnv.unauthenticatedContext().firestore(), "users/owner-a/datasetItems/dataset-2"), { ownerId: "owner-a", id: "dataset-2" }));
  });
});
