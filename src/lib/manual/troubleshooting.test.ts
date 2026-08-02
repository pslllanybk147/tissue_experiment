import { describe, expect, it } from "vitest";
import { sourceById } from "./sources";
import { troubleshootingById, troubleshootingEntries } from "./troubleshooting";

describe("troubleshooting library", () => {
  it("แยกการดำสองสาเหตุออกจากกัน เพราะวิธีแก้ตรงข้ามกัน", () => {
    const phenolic = troubleshootingById("browning-phenolic")!;
    const bleach = troubleshootingById("browning-bleach-damage")!;

    expect(phenolic).not.toBeNull();
    expect(bleach).not.toBeNull();
    expect(phenolic.distinguish).toBeTruthy();
    expect(bleach.distinguish).toBeTruthy();
    expect(phenolic.actions.join(" ")).not.toContain("ลดความเข้มข้น");
    expect(bleach.actions.join(" ")).toContain("ลด");
  });

  it("เตือนว่าสารต้านออกซิเดชันเป็นกรด ห้ามใช้ต่อจากสารฟอกโดยไม่ล้าง", () => {
    const phenolic = troubleshootingById("browning-phenolic")!;

    expect(phenolic.actions.join(" ")).toContain("ล้าง");
    expect(phenolic.actions.join(" ")).toContain("กรด");
  });

  it("แยกราออกจากแบคทีเรียได้", () => {
    expect(troubleshootingById("contamination-fungal")).not.toBeNull();
    expect(troubleshootingById("contamination-bacterial")).not.toBeNull();
  });

  it("ทุกอาการที่อ้างว่ามีหลักฐานต้องระบุแหล่งที่มีอยู่จริง", () => {
    for (const [id, entry] of Object.entries(troubleshootingEntries)) {
      if (entry.evidence.level === "unsupported") continue;
      expect(entry.evidence.sourceIds.length, `${id} อ้างหลักฐานแต่ไม่ระบุแหล่ง`).toBeGreaterThan(0);
      for (const sourceId of entry.evidence.sourceIds) {
        expect(sourceById(sourceId), `${id} อ้าง ${sourceId} ที่ไม่มีในทะเบียน`).not.toBeNull();
      }
    }
  });

  it("id ของแต่ละอาการตรงกับ key ที่ใช้เก็บ", () => {
    for (const [key, entry] of Object.entries(troubleshootingEntries)) {
      expect(entry.id).toBe(key);
    }
  });

  it("คืนค่า null เมื่อไม่รู้จัก id", () => {
    expect(troubleshootingById("ไม่มีอาการนี้")).toBeNull();
  });
});
