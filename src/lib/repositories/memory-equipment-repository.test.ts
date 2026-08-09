import { describe, expect, it } from "vitest";
import { createMemoryEquipmentRepository } from "./memory-equipment-repository";

describe("memory equipment repository", () => {
  it("ยังไม่เคยบันทึก คืนค่า null ไม่ใช่ค่าเริ่มต้นปลอม ๆ", async () => {
    const repo = createMemoryEquipmentRepository("owner-1");

    expect(await repo.get("owner-1")).toBeNull();
  });

  it("บันทึกแล้วอ่านกลับได้ครบ", async () => {
    const repo = createMemoryEquipmentRepository("owner-1");
    const kit = { owned: ["bleach" as const], scaleMinimumMg: 5, pipetteMinimumMl: 0.1, msLabelRateGPerL: 4.4 };

    await repo.save("owner-1", kit);

    expect(await repo.get("owner-1")).toMatchObject({ ...kit, schemaVersion: 2, msRateGPerL: 4.4 });
  });

  it("บันทึกทับของเดิมได้", async () => {
    const repo = createMemoryEquipmentRepository("owner-1");
    await repo.save("owner-1", { owned: [], scaleMinimumMg: 10, pipetteMinimumMl: 0.2, msLabelRateGPerL: 4.43 });
    await repo.save("owner-1", { owned: ["lab-autoclave"], scaleMinimumMg: 1, pipetteMinimumMl: 0.01, msLabelRateGPerL: 4.43 });

    expect((await repo.get("owner-1"))?.owned).toEqual(["lab-autoclave"]);
  });
});
