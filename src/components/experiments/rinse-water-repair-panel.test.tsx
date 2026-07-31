import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ExperimentLot } from "../../lib/domain/models";
import { RinseWaterRepairPanel } from "./rinse-water-repair-panel";

const lot: ExperimentLot = {
  id: "LOT-OLD-V2",
  ownerId: "owner-1",
  plant: "Pink Princess",
  protocolId: "protocol-pink-princess",
  protocolTitle: "Pink Princess · Nodal culture",
  workflowVersion: "v2",
  stage: "Establishment",
  status: "Healthy",
  startedAt: "2026-07-31",
  createdAt: "2026-07-31T00:00:00.000Z",
  updatedAt: "2026-07-31T00:00:00.000Z",
  sterilization: {
    profileId: "haiter-no-pressure-v1",
    profileVersion: "1.0.0",
    method: "haiter-chemical",
    activeChlorinePercent: 6,
    targetChlorinePercent: 0.003,
  },
};

describe("RinseWaterRepairPanel", () => {
  it("offers an inline 0.003% repair for an existing v2 lot that predates rinse-water snapshots", () => {
    const html = renderToStaticMarkup(<RinseWaterRepairPanel lot={lot} onSave={async () => undefined} />);
    expect(html).toContain("Lot นี้ยังไม่ได้บันทึกวิธีเตรียมน้ำล้าง");
    expect(html).toContain("active chlorine 0.003%");
    expect(html).toContain("บันทึกวิธีน้ำล้างให้ Lot นี้");
  });

  it("renders nothing once the lot has a rinse-water snapshot", () => {
    const html = renderToStaticMarkup(
      <RinseWaterRepairPanel
        lot={{ ...lot, sterilization: { ...lot.sterilization!, rinseWater: { method: "low-dose-hypochlorite", containerCount: 3, volumePerContainerMl: 50, preparationVolumeMl: 1000, targetChlorinePercent: 0.003, minimumWaitMinutes: 60 } } }}
        onSave={async () => undefined}
      />,
    );
    expect(html).toBe("");
  });
});
