import { describe, expect, it } from "vitest";

import { nextDraftVersion } from "./protocol-versioning";

describe("nextDraftVersion", () => {
  it("increments the minor version and resets patch", () => {
    expect(nextDraftVersion("1.2.3")).toBe("1.3.0");
  });

  it("rejects non-semantic versions", () => {
    expect(() => nextDraftVersion("v1")).toThrow("Invalid semantic version");
  });
});
