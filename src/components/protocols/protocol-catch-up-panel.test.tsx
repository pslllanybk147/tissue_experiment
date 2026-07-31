import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { ProtocolStep } from "@/lib/domain/models";
import { ProtocolCatchUpPanel } from "./protocol-catch-up-panel";

const steps: ProtocolStep[] = Array.from({ length: 10 }, (_, index) => ({
  id: `step-${index + 1}`,
  order: index + 1,
  title: `ขั้น ${index + 1}`,
  instruction: `ทำขั้น ${index + 1}`,
  durationMinutes: index === 7 ? 2880 : null,
  criticalControls: [],
  safetyNotes: [],
  referenceIds: [],
  evidenceState: "Adapted",
  objective: `ทำขั้น ${index + 1}`,
  requiredEvidence: [],
  allowPhoto: false,
  allowNote: true,
}));

describe("ProtocolCatchUpPanel", () => {
  it("summarizes one catch-up action without note or photo fields", () => {
    const html = renderToStaticMarkup(
      <ProtocolCatchUpPanel
        initialTargetStepId="step-9"
        onCancel={vi.fn()}
        onConfirm={vi.fn(async () => undefined)}
        runs={[]}
        steps={steps}
      />,
    );

    expect(html).toContain("ฉันจะเริ่มทำต่อจาก");
    expect(html).toContain("ขั้น 1–8 จะถูกระบุว่าทำไปแล้ว");
    expect(html).toContain("ขั้น 8");
    expect(html).toContain("ฉันยืนยันว่าครบเวลาที่กำหนดแล้ว");
    expect(html).toContain("วันที่โดยประมาณ (ไม่บังคับ)");
    expect(html).toContain("ยืนยันและเริ่มต่อจากขั้นนี้");
    expect(html).not.toContain("textarea");
    expect(html).not.toContain('type="file"');
  });
});
