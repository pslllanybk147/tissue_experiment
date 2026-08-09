import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JarAllocationPanel } from "./jar-allocation-panel";

describe("JarAllocationPanel", () => {
  it("แสดง 46 ใบ แยก control, แขนทดลอง และสำรอง พร้อมผลรวม", () => {
    const html = renderToStaticMarkup(
      <JarAllocationPanel
        total={46}
        reserved={1}
        allocations={{ "control-a": 9, "control-b": 9, t1: 9, t2: 9, t3: 9 }}
        onReserved={() => {}}
        onAllocation={() => {}}
      />,
    );

    expect(html).toContain("มีทั้งหมด 46 ใบ");
    expect(html).toContain("Control-A (ใบ)");
    expect(html).toContain("Control-B กระปุกเปล่า (ใบ)");
    expect(html).toContain("สำรอง (ใบ)");
    expect(html).toContain("ใช้ 46 จาก 46 ใบ");
  });
});
