import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ExperimentLot } from "@/lib/domain/models";
import { ExperimentList } from "./experiment-list";

const lot: ExperimentLot = {
  id: "PPP-001", ownerId: "u1", plant: "Pink Princess", protocolId: "p1", protocolTitle: "Nodal",
  stage: "Establishment", status: "Healthy", startedAt: "2026-07-22", createdAt: "t", updatedAt: "t",
};

describe("ExperimentList", () => {
  it("renders searchable lot rows", () => {
    const html = renderToStaticMarkup(<ExperimentList lots={[lot]} />);
    expect(html).toContain("Search lots");
    expect(html).toContain("PPP-001");
    expect(html).toContain("Pink Princess");
    expect(html).toContain('href="/experiments/PPP-001"');
  });

  it("renders an explicit empty state", () => {
    expect(renderToStaticMarkup(<ExperimentList lots={[]} />)).toContain("ยังไม่มี Experiment Lot");
  });

  it("shows restore action for a soft-deleted lot", () => {
    const html = renderToStaticMarkup(<ExperimentList lots={[{ ...lot, deletedAt: "2026-07-24T00:00:00.000Z" }]} showDeleted onRestore={async () => undefined} />);
    expect(html).toContain("อยู่ในถังขยะ");
    expect(html).toContain("กู้คืน Lot");
  });
});
