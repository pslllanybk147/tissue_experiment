import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolvePath } from "@/lib/equipment/resolve-path";
import { PathSummary } from "./path-summary";

const kit = (owned: string[]) => ({
  owned: owned as never,
  scaleMinimumMg: 10,
  pipetteMinimumMl: 0.2,
  msLabelRateGPerL: 4.43,
});

describe("PathSummary", () => {
  it("แสดงครบทั้งสี่สิ่งที่ต้องได้ พร้อมวิธีที่เลือกให้", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["lab-autoclave", "heat-resistant-vessels", "bleach"]))} />);

    expect(html).toContain("อาหารปลอดเชื้อ");
    expect(html).toContain("น้ำปลอดเชื้อสำหรับล้าง");
    expect(html).toContain("ภาชนะและฝาปลอดเชื้อ");
    expect(html).toContain("ผิวชิ้นพืชสะอาด");
  });

  it("อธิบายว่าระดับรวมมาจากจุดที่อ่อนที่สุด", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["lab-autoclave", "heat-resistant-vessels", "bleach"]))} />);

    expect(html).toContain("จุดที่อ่อนที่สุด");
  });

  it("เมื่อยังทำบางอย่างไม่ได้ ต้องกางทางเลือกให้เห็น ไม่ใช่เงียบ", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["bleach"]))} />);

    expect(html).toContain("ยังทำไม่ได้");
    expect(html).toContain("ซื้อน้ำเกลือปลอดเชื้อจากร้านขายยา");
  });

  it("เตือนความเสี่ยงของวิธีที่มีข้อควรระวัง", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["bleach"]))} />);

    expect(html).toContain("กระปุกเปล่าคุม");
  });
});
