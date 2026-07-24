import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProtocolEditor } from "./protocol-editor";

describe("ProtocolEditor", () => {
  it("renders metadata, ordered steps and controls", () => {
    const html = renderToStaticMarkup(<ProtocolEditor initialValue={{ title: "Nodal", plantScope: "Philodendron", evidenceState: "Adapted", summary: "", changeNote: "", steps: [{ id: "s1", order: 0, title: "Wash", instruction: "Wash", durationMinutes: 10, criticalControls: [], safetyNotes: [], referenceIds: [], evidenceState: "Adapted" }] }} onSubmit={async () => undefined} />);
    expect(html).toContain("เพิ่มขั้นตอน"); expect(html).toContain("ขึ้น"); expect(html).toContain("ลง"); expect(html).toContain("Source IDs"); expect(html).toContain("Reference IDs ของขั้นนี้");
  });
});
