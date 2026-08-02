import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvidenceBadge, evidenceLabel } from "./evidence-badge";

describe("EvidenceBadge", () => {
  it("แปลระดับหลักฐานเป็นคำที่คนทั่วไปเข้าใจ", () => {
    expect(evidenceLabel["species-direct"]).toBe("ตรงพันธุ์");
    expect(evidenceLabel.adapted).toBe("ประยุกต์");
    expect(evidenceLabel.unsupported).toBe("ยังไม่มีงานรองรับ");
  });

  it("ใช้คลาสสีต่างกันตามระดับ", () => {
    expect(renderToStaticMarkup(<EvidenceBadge level="species-direct" />)).toContain("pl-chip-direct");
    expect(renderToStaticMarkup(<EvidenceBadge level="adapted" />)).toContain("pl-chip-adapted");
    expect(renderToStaticMarkup(<EvidenceBadge level="unsupported" />)).toContain("pl-chip-unsupported");
  });

  it("บอกความหมายให้โปรแกรมอ่านหน้าจอ ไม่ใช่สื่อด้วยสีอย่างเดียว", () => {
    const html = renderToStaticMarkup(<EvidenceBadge level="unsupported" />);

    expect(html).toContain("ระดับหลักฐาน");
    expect(html).toContain("ยังไม่มีงานรองรับ");
  });
});
