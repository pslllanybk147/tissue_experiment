import { describe, expect, it } from "vitest";
import { capabilityIds } from "./capabilities";
import { resolvePath } from "./resolve-path";

const kit = (owned: string[]) => ({
  owned: owned as never,
  scaleMinimumMg: 10,
  pipetteMinimumMl: 0.2,
  msLabelRateGPerL: 4.43,
});

describe("resolvePath", () => {
  it("รายงานครบทั้งสี่ความสามารถเสมอ แม้ไม่มีของเลย", () => {
    const path = resolvePath(kit([]));

    expect(path.capabilities.map((item) => item.capability)).toEqual([...capabilityIds]);
  });

  it("ไม่มีของเลย ทุกอย่างตัน และบอกว่าตันข้อไหนบ้าง", () => {
    const path = resolvePath(kit([]));

    expect(path.capabilities.every((item) => item.method === null)).toBe(true);
    expect(path.blocked).toEqual([...capabilityIds]);
    expect(path.overallLevel).toBeNull();
  });

  it("มีหม้อนึ่งของแล็บ ได้ทั้งอาหาร น้ำ และภาชนะ", () => {
    const path = resolvePath(kit(["lab-autoclave", "heat-resistant-vessels"]));
    const byId = new Map(path.capabilities.map((item) => [item.capability, item]));

    expect(byId.get("sterile-medium")?.method).not.toBeNull();
    expect(byId.get("sterile-water")?.method).not.toBeNull();
    expect(byId.get("sterile-vessel")?.method).not.toBeNull();
  });

  it("หม้ออัดแรงดันทำอาหารใช้แทนหม้อนึ่งของแล็บได้", () => {
    const withCooker = resolvePath(kit(["pressure-cooker", "heat-resistant-vessels"]));
    const blockedIds = withCooker.blocked;

    expect(blockedIds).not.toContain("sterile-medium");
    expect(blockedIds).not.toContain("sterile-water");
  });

  it("มีแค่ไฮเตอร์ไม่ทำให้น้ำถูกเรียกว่าน้ำปลอดเชื้อ และเครื่องมือยังตัน", () => {
    const path = resolvePath(kit(["bleach"]));

    expect(path.blocked).toEqual(["sterile-water", "sterile-tools"]);
  });

  it("มีไฮเตอร์กับแอลกอฮอล์ยังขาดน้ำปลอดเชื้อ แม้มีทางเลือก rinse ทดลอง", () => {
    const path = resolvePath(kit(["bleach", "alcohol-70"]));

    expect(path.blocked).toEqual(["sterile-water"]);
    expect(path.overallLevel).toBeNull();
  });

  it("เม็ดคลอรีน NaDCC ใช้แทนไฮเตอร์ในการทำอาหารได้", () => {
    const path = resolvePath(kit(["nadcc-tablet", "alcohol-70"]));
    const byId = new Map(path.capabilities.map((item) => [item.capability, item]));

    expect(byId.get("sterile-medium")?.method?.id).toBe("medium-nadcc");
  });

  it("ระดับรวมเท่ากับจุดที่อ่อนที่สุด ไม่ใช่จุดที่แข็งที่สุด", () => {
    const path = resolvePath(kit(["bleach", "pharmacy-sterile-water", "stove-pot", "alcohol-70"]));
    const levels = path.capabilities.map((item) => item.method?.evidence.level);

    expect(levels).not.toContain(undefined);
    if (levels.includes("unsupported")) expect(path.overallLevel).toBe("unsupported");
    else expect(path.overallLevel).toBe("adapted");
  });

  it("เสนอทางเลือกของความสามารถที่ตัน เพื่อให้ผู้ใช้ตัดสินใจเอง", () => {
    const path = resolvePath(kit(["bleach"]));
    const tools = path.capabilities.find((item) => item.capability === "sterile-tools");

    expect(tools?.alternatives.length).toBeGreaterThan(0);
  });

  // ชุดจริงของเจ้าของเมื่อ 7 สิงหาคม 2026 คือไม่มีหม้อนึ่งและไม่มีหม้ออัดแรงดัน
  // เทสต์นี้กันไม่ให้การแก้ในอนาคตทำให้ชุดนี้กลับไปตันอีก
  it("ชุดที่ไม่มีหม้อนึ่งเลย ต้องเดินได้ครบทุกความสามารถ", () => {
    const path = resolvePath(kit(["bleach", "alcohol-70", "stove-pot", "thermometer"]));

    expect(path.blocked).toEqual([]);
  });
});
