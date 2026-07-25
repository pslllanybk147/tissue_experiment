import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { protocolTemplates } from "../../lib/domain/protocol-templates";
import { sterilizationProfiles } from "../../lib/domain/sterilization-profiles";
import { BeginnerLotWizard } from "./beginner-lot-wizard";

describe("BeginnerLotWizard", () => {
  test("shows the five-stage beginner journey and starts with plant context", () => {
    const html = renderToStaticMarkup(
      <BeginnerLotWizard
        initialPlantName="Pink Princess"
        initialTemplateId="template-pink-princess-nodal"
        onSubmit={async () => undefined}
        protocolOptions={[]}
        profiles={sterilizationProfiles}
        templates={protocolTemplates}
      />,
    );

    expect(html).toContain("เพิ่มต้นไม้");
    expect(html).toContain("เลือกเป้าหมาย");
    expect(html).toContain("เลือกวิธีฆ่าเชื้อ");
    expect(html).toContain("ตรวจอุปกรณ์");
    expect(html).toContain("สร้าง Lot");
    expect(html).toContain("Pink Princess");
  });

  test("renders both sterilization methods with beginner descriptions", () => {
    const html = renderToStaticMarkup(
      <BeginnerLotWizard
        onSubmit={async () => undefined}
        protocolOptions={[]}
        profiles={sterilizationProfiles}
        templates={protocolTemplates}
      />,
    );

    expect(html).toContain("ไฮเตอร์ / NaOCl");
    expect(html).toContain("หม้อนึ่งแรงดัน");
    expect(html).toContain("อย่าเพิ่งตัดต้นไม้");
    expect(html).toContain("ใช้แบบฟอร์มขั้นสูง");
  });
});
