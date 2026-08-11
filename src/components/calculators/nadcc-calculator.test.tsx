import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NadccCalculator } from "./nadcc-calculator";

describe("NadccCalculator", () => {
  it("แสดงข้อเท็จจริงบนฉลาก ค่าคำนวณ และคำสั่งที่ปัดตาม syringe แยกกัน", () => {
    const html = renderToStaticMarkup(<NadccCalculator initialInput={{ finalVolumeMl: 1000, minimumMeasurableMl: 0.1 }} />);

    expect(html).toContain("เม็ดทั้งเม็ด 5.4 g");
    expect(html).toContain("NaDCC 2.97 g");
    expect(html).toContain("ค่าคำนวณก่อนปัด");
    expect(html).toContain("16.835017 mL");
    expect(html).toContain("ตวงจริง 16.8 mL");
    expect(html).toContain("ความละเอียด 0.1 mL");
    expect(html).toContain("ปัดลง");
    expect(html).toContain("cl-field-group");
    expect(html).toContain("aria-live");
  });

  it("uses explicit unit cells without changing the default calculation", () => {
    const html = renderToStaticMarkup(<NadccCalculator initialInput={{ finalVolumeMl: 1000, minimumMeasurableMl: 0.1 }} />);

    expect(html).toContain("cl-atlas-form-section");
    expect(html).toContain("cl-atlas-field-grid");
    expect(html).toContain("cl-field-unit");
    expect(html).toContain("cl-atlas-result");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-label="ผลการคำนวณ NaDCC"');
    expect(html).not.toContain("<output");
    expect(html).toContain("ค่าจากสูตร ยังไม่ใช่ค่าตรวจ");
    expect(html).toContain("16.835017 mL");
  });
});
