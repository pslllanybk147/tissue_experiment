import { describe, expect, it } from "vitest";

import { createHaiterActionPlan } from "./haiter-guidance";

describe("createHaiterActionPlan", () => {
  it("returns a direct physical instruction when the dose is measurable", () => {
    expect(createHaiterActionPlan({
      labelPercent: 6,
      targetPercent: 0.003,
      mediumVolumeMl: 1000,
      minimumToolVolumeMl: 0.1,
      permittedDiluent: "น้ำปลอดเชื้อ",
    })).toMatchObject({
      state: "direct",
      primaryInstruction: "ตวงไฮเตอร์จากขวด 0.50 mL",
    });
  });

  it("returns a complete working-solution recipe when the direct dose is too small", () => {
    const plan = createHaiterActionPlan({
      labelPercent: 6,
      targetPercent: 0.003,
      mediumVolumeMl: 100,
      minimumToolVolumeMl: 0.1,
      permittedDiluent: "น้ำปลอดเชื้อ",
    });

    expect(plan.state).toBe("working-dilution");
    if (plan.state !== "working-dilution") return;
    expect(plan.actions).toContain("ตวงไฮเตอร์จากขวด 1.00 mL");
    expect(plan.actions).toContain("เติมน้ำปลอดเชื้อ 9.00 mL");
    expect(plan.actions).toContain("ตวงสารที่เจือจางแล้ว 0.50 mL ไปใช้กับอาหาร 100 mL");
    expect(plan.actions.join(" ")).not.toMatch(/C1V1|C2V2|Cworking|V1/);
  });

  it("blocks instead of guessing when the label value is missing", () => {
    expect(createHaiterActionPlan({
      labelPercent: null,
      targetPercent: 0.003,
      mediumVolumeMl: 100,
      minimumToolVolumeMl: 0.1,
      permittedDiluent: "น้ำปลอดเชื้อ",
    })).toEqual({
      state: "blocked",
      reason: "ยังไม่มีเปอร์เซ็นต์คลอรีนจากฉลาก",
      safeAction: "หยุดไว้ก่อน ถ่ายรูปฉลากด้านหน้าและด้านหลังให้เห็นตัวเลขเปอร์เซ็นต์ แล้วขอให้ตรวจ",
    });
  });

  it("blocks when the proposed working recipe cannot be measured", () => {
    const plan = createHaiterActionPlan({
      labelPercent: 6,
      targetPercent: 0.00001,
      mediumVolumeMl: 10,
      minimumToolVolumeMl: 5,
      permittedDiluent: "น้ำปลอดเชื้อ",
    });

    expect(plan.state).toBe("blocked");
  });
});
