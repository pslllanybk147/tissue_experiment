import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ExperimentLot } from "@/lib/domain/models";
import { PlantExperimentSummary } from "./plant-experiment-summary";

const lot: ExperimentLot = { id: "PPP-001", ownerId: "owner-1", plant: "Pink Princess", protocolId: "protocol-1", protocolTitle: "Pink Princess Nodal", protocolVersionId: "version-1", stage: "Establishment", status: "Healthy", startedAt: "2026-07-24", createdAt: "2026-07-24", updatedAt: "2026-07-24", plantId: "plant-1", templateId: "template-pink-princess-nodal", method: "nodal" };

describe("PlantExperimentSummary", () => {
  it("links a plant profile to its experiment lot progress", () => {
    const html = renderToStaticMarkup(<PlantExperimentSummary items={[{ lot, recordedSteps: 2, passedSteps: 1 }]} />);
    expect(html).toContain("PPP-001");
    expect(html).toContain("1/2 ขั้นผ่าน");
    expect(html).toContain("เปิด Lot");
  });
});
