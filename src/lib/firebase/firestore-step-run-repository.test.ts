import { describe, expect, it } from "vitest";

import { removeUndefinedStepRunFields } from "./firestore-step-run-repository";

describe("Firestore step-run serialization", () => {
  it("removes optional undefined timer fields before writing", () => {
    expect(removeUndefinedStepRunFields({
      stepId: "step-1",
      timerStartedAt: undefined,
      timerEndsAt: undefined,
      completedAt: undefined,
      measurements: { pH: 5.7 },
    })).toEqual({
      stepId: "step-1",
      measurements: { pH: 5.7 },
    });
  });
});
