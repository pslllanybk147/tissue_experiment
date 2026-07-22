import { describe, expect, it } from "vitest";

import { authSessionReducer, initialAuthSession } from "./auth-session";

describe("authSessionReducer", () => {
  it("moves from loading to signed out", () => {
    expect(authSessionReducer(initialAuthSession, { type: "SIGNED_OUT" })).toEqual({ status: "signed-out", user: null });
  });

  it("creates a clearly labeled demo owner session", () => {
    expect(authSessionReducer(initialAuthSession, { type: "DEMO" })).toEqual({
      status: "demo",
      user: { uid: "demo-owner", displayName: "Ohm", email: null, photoURL: null },
    });
  });

  it("reports an unconfigured Firebase project", () => {
    expect(authSessionReducer(initialAuthSession, { type: "UNCONFIGURED" })).toEqual({ status: "unconfigured", user: null });
  });
});
