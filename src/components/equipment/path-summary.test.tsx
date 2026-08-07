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
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["lab-autoclave", "heat-resistant-vessels", "bleach", "alcohol-70"]))} />);

    expect(html).toContain("จุดที่อ่อนที่สุด");
  });

  // ไฮเตอร์อย่างเดียวไม่ตันที่น้ำอีกแล้ว แต่ไปตันที่เครื่องมือปลอดเชื้อแทน
  it("เมื่อยังทำบางอย่างไม่ได้ ต้องกางทางเลือกให้เห็น ไม่ใช่เงียบ", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["bleach"]))} />);

    expect(html).toContain("ยังทำไม่ได้");
    expect(html).toContain("คีมและใบมีดปลอดเชื้อ");
    expect(html).toContain("ต้มเครื่องมือก่อนเริ่ม");
  });

  it("เตือนความเสี่ยงของวิธีที่มีข้อควรระวัง", () => {
    const html = renderToStaticMarkup(<PathSummary path={resolvePath(kit(["bleach"]))} />);

    expect(html).toContain("กระปุกเปล่าคุม");
  });
});
