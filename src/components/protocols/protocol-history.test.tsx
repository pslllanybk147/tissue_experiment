import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProtocolHistory } from "./protocol-history";

describe("ProtocolHistory", () => {
  it("marks published versions immutable", () => {
    const html = renderToStaticMarkup(<ProtocolHistory versions={[{ id: "v1", protocolId: "p1", ownerId: "o1", version: "0.1.0", summary: "First", changeNote: "Initial", steps: [], createdBy: "o1", createdAt: "t", publishedAt: "t" }]} />);
    expect(html).toContain("0.1.0"); expect(html).toContain("เผยแพร่แล้ว");
  });

  it("shows a compact compare summary for two versions", () => {
    const base = { protocolId: "p1", ownerId: "o1", summary: "First", changeNote: "Initial", createdBy: "o1", publishedAt: null as string | null, sourceIds: ["source-1"] };
    const html = renderToStaticMarkup(<ProtocolHistory versions={[{ ...base, id: "v1", version: "0.1.0", createdAt: "2026-01-01", steps: [{ id: "s1", order: 0, title: "Wash", instruction: "Wash", durationMinutes: 1, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" }] }, { ...base, id: "v2", version: "0.2.0", createdAt: "2026-01-02", steps: [{ id: "s1", order: 0, title: "Wash better", instruction: "Wash", durationMinutes: 1, criticalControls: [], safetyNotes: [], referenceIds: ["source-2"], evidenceState: "Adapted" }] }]} />);
    expect(html).toContain("VERSION COMPARE"); expect(html).toContain("0.1.0 → 0.2.0"); expect(html).toContain("1 ขั้นเปลี่ยนแปลง");
  });
});
