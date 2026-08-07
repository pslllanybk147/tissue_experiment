import { describe, expect, it } from "vitest";

import { manualSources } from "../sources";
import { formById, growthForms } from "./registry";

const sourceIds = new Set(manualSources.map((source) => source.id));

describe("ทะเบียนทรงการเติบโต", () => {
  it("ไม่มี id ซ้ำ", () => {
    const ids = growthForms.map((form) => form.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ทุกแหล่งที่อ้างมีอยู่จริงในทะเบียนแหล่ง", () => {
    for (const form of growthForms) {
      const refs = [form.defaultExplant.evidence, ...form.landmarks.map((landmark) => landmark.evidence)];
      for (const ref of refs) {
        for (const id of ref.sourceIds) {
          expect(sourceIds.has(id), `${form.id} อ้าง ${id} ที่ไม่มีในทะเบียน`).toBe(true);
        }
      }
    }
  });

  it("จุดตัดอ้าง landmark ที่มีอยู่จริงในทรงนั้น", () => {
    for (const form of growthForms) {
      const ids = new Set(form.landmarks.map((landmark) => landmark.id));
      expect(ids.has(form.defaultExplant.landmarkId), `${form.id} ตัดที่ landmark ที่ไม่มีอยู่`).toBe(true);
    }
  });

  it("มีพิกัดได้เมื่อทรงมีภาพเท่านั้น", () => {
    for (const form of growthForms) {
      if (form.referenceImage) continue;
      for (const landmark of form.landmarks) {
        expect(landmark.point, `${form.id}/${landmark.id} มีพิกัดแต่ทรงยังไม่มีภาพ`).toBeUndefined();
      }
    }
  });

  it("คำนิยามของจุดสังเกตต้องเป็นข้อมูลจากตำราและระบุแหล่ง", () => {
    for (const form of growthForms) {
      for (const landmark of form.landmarks) {
        expect(landmark.evidence.level, `${form.id}/${landmark.id} ไม่ใช่ข้อมูลจากตำรา`).toBe("botanical-fact");
        expect(landmark.evidence.sourceIds.length, `${form.id}/${landmark.id} ไม่ระบุแหล่ง`).toBeGreaterThan(0);
      }
    }
  });

  it("ค่าเชิงปริมาณต้องระบุรูปแบบที่ใช้จริง และช่วงต้องเรียงถูกทาง", () => {
    for (const form of growthForms) {
      for (const [key, dose] of Object.entries(form.defaultDoses ?? {})) {
        expect(dose.form.trim().length, `${form.id}/${key} ไม่ระบุชื่อและรูปแบบของสารที่ใช้จริง`).toBeGreaterThan(0);
        expect(dose.low, `${form.id}/${key} ปลายต่ำมากกว่าปลายสูง`).toBeLessThanOrEqual(dose.high);
        expect(dose.durationMin[0], `${form.id}/${key} เวลาต้นช่วงมากกว่าปลายช่วง`).toBeLessThanOrEqual(dose.durationMin[1]);
      }
    }
  });

  it("ค้นทรงด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(formById("climbing-vine-visible-node")?.id).toBe("climbing-vine-visible-node");
    expect(formById("ไม่มีทรงนี้")).toBeNull();
  });
});
