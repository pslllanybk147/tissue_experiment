import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { resolveTrialArmReadiness } from "./trial-readiness";

describe("resolveTrialArmReadiness", () => {
  it("requires sterile water for Control-A and T3, not for chlorinated rinse arms", () => {
    expect(resolveTrialArmReadiness(USER_REPORTED_PROFILE, "control-a").blockers.join(" ")).toMatch(/ปลอดเชื้อ/);
    expect(resolveTrialArmReadiness(USER_REPORTED_PROFILE, "t3").blockers.join(" ")).toMatch(/ปลอดเชื้อ/);
    expect(resolveTrialArmReadiness(USER_REPORTED_PROFILE, "t1").blockers.join(" ")).toMatch(/rinse/);
  });
});
