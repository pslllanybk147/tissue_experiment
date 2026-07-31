import { describe, expect, it } from "vitest";

import {
  buildLowDoseRinseWaterSnapshot,
  minimumPressureSteamMinutes,
  rinseWaterTotalMl,
} from "./rinse-water-planning";

describe("sterile rinse-water planning", () => {
  it.each([
    [25, 20],
    [50, 25],
    [100, 28],
    [250, 31],
    [500, 35],
    [1000, 40],
  ])("returns the minimum published cycle for %i mL", (volumeMl, minutes) => {
    expect(minimumPressureSteamMinutes(volumeMl)).toBe(minutes);
  });

  it("rejects volumes outside the published table", () => {
    expect(() => minimumPressureSteamMinutes(1001)).toThrow(/1,000 mL/);
    expect(() => minimumPressureSteamMinutes(0)).toThrow(/มากกว่า 0/);
  });

  it("calculates three separate rinse vessels", () => {
    expect(rinseWaterTotalMl(50)).toBe(150);
  });

  it("locks the no-pressure Haiter rinse to 0.003% independently from the 0.6% explant soak", () => {
    expect(buildLowDoseRinseWaterSnapshot(50)).toEqual({
      method: "low-dose-hypochlorite",
      containerCount: 3,
      volumePerContainerMl: 50,
      preparationVolumeMl: 1000,
      targetChlorinePercent: 0.003,
      minimumWaitMinutes: 60,
    });
  });
});
