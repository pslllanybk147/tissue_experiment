import { describe, expect, it } from "vitest";

import { formById } from "../forms/registry";
import { manualSources } from "../sources";
import { generaPacks, genusById } from "./registry";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนสกุล", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = generaPacks.map((pack) => pack.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกสกุลผูกกับทรงที่มีอยู่จริง", () => {
    for (const pack of generaPacks) {
      expect(formById(pack.growthFormId), `${pack.id} ผูกกับทรงที่ไม่มีอยู่`).not.toBeNull();
    }
  });

  it("ทุกแหล่งที่อ้างมีอยู่จริงในทะเบียนแหล่ง", () => {
    for (const pack of generaPacks) {
      for (const id of pack.sourceIds) {
        expect(sourceIds.has(id), `${pack.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
      }
    }
  });

  it("ค่าที่ยืมมาจากชนิดอื่นต้องบอกว่ายืมมาจากชนิดไหน", () => {
    for (const pack of generaPacks) {
      for (const [stepId, override] of Object.entries(pack.deviations)) {
        if (!override.evidence) continue;
        if (override.evidence.level !== "adapted") continue;
        expect(
          override.evidence.note,
          `${pack.id}/${stepId} เป็นค่าประยุกต์แต่ไม่บอกว่ามาจากชนิดไหน`,
        ).toBeTruthy();
      }
    }
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(genusById("philodendron")?.id).toBe("philodendron");
    expect(genusById("ไม่มี")).toBeNull();
  });
});
