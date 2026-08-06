import { describe, expect, it } from "vitest";

import { createMemoryCalibrationRepository } from "@/lib/repositories/memory-calibration-repository";
import { calibrationKey, type CalibrationEntry } from "./calibration";

const entry: CalibrationEntry = {
  slug: "pink-princess",
  stepId: "sterilize",
  doseKey: "sterilize.dose",
  value: 1.4,
  unit: "%",
  jarsPerArm: 3,
  usable: 3,
  lotId: "round-1",
  decidedAt: "2026-08-06",
};

describe("ค่าที่ทดสอบได้", () => {
  it("คีย์ประกอบจากพืช ขั้น และชื่อค่า", () => {
    expect(calibrationKey("pink-princess", "sterilize", "sterilize.dose")).toBe(
      "pink-princess:sterilize:sterilize.dose",
    );
  });

  it("บันทึกแล้วอ่านกลับได้", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner", entry);
    expect(await repo.list("owner")).toEqual([entry]);
  });

  it("ทดสอบซ้ำของขั้นเดิม ทับค่าเดิม ไม่ใช่เพิ่มรายการใหม่", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner", entry);
    await repo.save("owner", { ...entry, value: 0.8, decidedAt: "2026-09-01" });
    const found = await repo.list("owner");
    expect(found).toHaveLength(1);
    expect(found[0].value).toBe(0.8);
  });

  it("ค่าของขั้นคนละขั้นอยู่แยกกัน", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner", entry);
    await repo.save("owner", { ...entry, stepId: "multiply", doseKey: "multiply.cytokinin" });
    expect(await repo.list("owner")).toHaveLength(2);
  });

  it("ค่าของเจ้าของคนละคนไม่ปนกัน", async () => {
    const repo = createMemoryCalibrationRepository();
    await repo.save("owner-a", entry);
    expect(await repo.list("owner-b")).toEqual([]);
  });
});
