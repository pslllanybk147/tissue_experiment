import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getFirebaseProjectId } from "./token-verifier";

describe("Firebase token verifier", () => {
  it("uses the server project id before the public fallback", () => {
    expect(getFirebaseProjectId({
      FIREBASE_ADMIN_PROJECT_ID: "admin-project",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "public-project",
    })).toBe("admin-project");
  });

  it("does not import firebase-admin into the Vercel token verification path", () => {
    const source = readFileSync(
      fileURLToPath(new URL("./token-verifier.ts", import.meta.url)),
      "utf8",
    );

    expect(source).not.toContain("firebase-admin");
  });
});
