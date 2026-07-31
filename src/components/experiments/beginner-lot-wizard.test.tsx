import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { protocolTemplates } from "../../lib/domain/protocol-templates";
import { sterilizationProfiles } from "../../lib/domain/sterilization-profiles";
import {
  BeginnerLotWizard,
  createSuggestedLotId,
  resolveTaxonIdForTemplate,
} from "./beginner-lot-wizard";

describe("BeginnerLotWizard", () => {
  test("suggests a timestamped lot id so same-day lots do not collide", () => {
    expect(createSuggestedLotId(new Date("2026-07-25T08:09:10.000Z"))).toBe(
      "LOT-20260725-080910",
    );
    expect(createSuggestedLotId(new Date("2026-07-25T08:09:11.000Z"))).not.toBe(
      createSuggestedLotId(new Date("2026-07-25T08:09:10.000Z")),
    );
  });

  test("links Pink Princess template to its taxon when the wizard started without a Plant record", () => {
    expect(
      resolveTaxonIdForTemplate(undefined, "template-pink-princess-nodal"),
    ).toBe("cultivar-pink-princess");
  });

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

  test("asks for an observable label value instead of showing an equation", () => {
    const html = renderToStaticMarkup(
      <BeginnerLotWizard
        initialPlantName="Pink Princess"
        onSubmit={async () => undefined}
        protocolOptions={[]}
        profiles={sterilizationProfiles}
        templates={protocolTemplates}
      />,
    );

    expect(html).toContain("ตัวเลขเปอร์เซ็นต์ที่พิมพ์อยู่บนฉลาก");
    expect(html).toContain("หาเปอร์เซ็นต์ไม่เจอ");
    expect(html).not.toMatch(/C1V1|C2V2/);
  });
});
