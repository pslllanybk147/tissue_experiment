import { describe, expect, it } from "vitest";
import { allocateTrialJars } from "./jar-allocation";

const roles = ["control-a", "control-b", "t1", "t2", "t3"] as const;

describe("allocateTrialJars", () => {
  it("แบ่ง 46 ใบเป็นจำนวนเต็ม มีสำรอง และไม่ทำกระปุกหายหรือเพิ่มเอง", () => {
    const result = allocateTrialJars(46, roles, 1);
    const allocated = Object.values(result.allocations).reduce((sum, value) => sum + value, 0);

    expect(result.allocations).toEqual({ "control-a": 9, "control-b": 9, t1: 9, t2: 9, t3: 9 });
    expect(result.allocations["control-b"]).toBeGreaterThan(0);
    expect(allocated + result.reserved + result.unassigned).toBe(46);
  });

  it("จำนวนต่ำกว่าห้าไม่ติดลบและยังรักษาผลรวม", () => {
    const result = allocateTrialJars(3, roles, 1);
    expect(Object.values(result.allocations).every((value) => Number.isInteger(value) && value >= 0)).toBe(true);
    expect(Object.values(result.allocations).reduce((sum, value) => sum + value, 0) + result.reserved + result.unassigned).toBe(3);
  });

  it("ปฏิเสธจำนวนติดลบหรือไม่ใช่จำนวนเต็ม", () => {
    expect(() => allocateTrialJars(-1, roles, 0)).toThrow(/จำนวนเต็ม/);
    expect(() => allocateTrialJars(46.5, roles, 1)).toThrow(/จำนวนเต็ม/);
  });
});
