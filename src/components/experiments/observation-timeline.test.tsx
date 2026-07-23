import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Observation } from "../../lib/domain/models";
import { ObservationTimeline } from "./observation-timeline";

const item: Observation = { id: "o1", lotId: "PPP-001", ownerId: "u1", createdBy: "u1", observedAt: "2026-07-22T09:00", status: "Healthy", stage: "Establishment", note: "ตาข้างเริ่มบวม", shootCount: 1, rootCount: 0, contaminationCount: 0, createdAt: "t", updatedAt: "t", deletedAt: null };
describe("ObservationTimeline", () => {
  it("renders measurements and mutation actions", () => {
    const html = renderToStaticMarkup(<ObservationTimeline observations={[item]} onDelete={async () => undefined} onEdit={() => undefined} onRestore={async () => undefined} />);
    expect(html).toContain("ตาข้างเริ่มบวม"); expect(html).toContain("แก้ไข"); expect(html).toContain("ลบ");
  });
  it("offers restore for deleted observations", () => {
    const html = renderToStaticMarkup(<ObservationTimeline observations={[{ ...item, deletedAt: "2026-07-22" }]} onDelete={async () => undefined} onEdit={() => undefined} onRestore={async () => undefined} />);
    expect(html).toContain("กู้คืน");
  });
  it("renders observation-specific media controls",()=>{const html=renderToStaticMarkup(<ObservationTimeline observations={[item]} onDelete={async()=>{}} onEdit={()=>{}} onRestore={async()=>{}} renderMedia={observation=><div>media-{observation.id}</div>}/>);expect(html).toContain("media-o1")});
});
