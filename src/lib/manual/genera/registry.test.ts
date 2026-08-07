import { describe, expect, it } from "vitest";

import { coreSteps } from "../core-steps";
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

  // ชั้นสกุลไหลลงไปหาทุกชนิดในสกุล การอ้างว่า "ตรงพันธุ์" ที่ชั้นนี้จึงเป็นไปไม่ได้เสมอ
  // ต่อให้หลักฐานตรงพันธุ์จริงสำหรับชนิดหนึ่ง มันก็เป็นแค่ค่าประยุกต์สำหรับชนิดที่เหลือ
  // ตัวเลขที่ผูกกับพันธุ์ต้องอยู่ที่ชั้นชนิด ไม่ใช่ชั้นนี้
  it("ชั้นสกุลอ้างระดับตรงพันธุ์ไม่ได้ เพราะค่าจะไหลลงไปหาทุกชนิดในสกุล", () => {
    for (const pack of generaPacks) {
      for (const [stepId, override] of Object.entries(pack.deviations)) {
        expect(
          override.evidence?.level,
          `${pack.id}/${stepId} อ้างตรงพันธุ์ที่ชั้นสกุล ต้องย้ายตัวเลขลงไปที่ชั้นชนิด`,
        ).not.toBe("species-direct");
      }
      // ค่าช่วงวางได้สองที่ คือระดับสกุล (pack.doses) และระดับขั้น (deviations[x].doses)
      // ต้องตรวจทั้งคู่ ไม่งั้นครึ่งหนึ่งของทางที่คนเขียนใส่ค่าได้จริงจะหลุดการตรวจ
      const dosesInPack = Object.entries(pack.doses ?? {});
      const dosesInSteps = Object.entries(pack.deviations).flatMap(([stepId, override]) =>
        Object.entries(override.doses ?? {}).map(
          ([key, dose]) => [`${stepId}/${key}`, dose] as const,
        ),
      );
      for (const [doseKey, dose] of [...dosesInPack, ...dosesInSteps]) {
        expect(
          dose.evidence.level,
          `${pack.id} ค่าช่วง ${doseKey} อ้างตรงพันธุ์ที่ชั้นสกุล`,
        ).not.toBe("species-direct");
      }
    }
  });

  it("ทุกขั้นที่สกุลทับค่า ต้องเป็นขั้นที่มีอยู่จริงในแกนกลาง", () => {
    // พิมพ์ชื่อขั้นผิดจะไม่ทำให้อะไรพัง แค่ทับค่าไม่ติดแล้วเงียบไป
    // ซึ่งอันตรายกว่าพังเสียอีก เพราะคู่มือจะแสดงค่ากลางทั้งที่คนเขียนคิดว่าแก้แล้ว
    for (const pack of generaPacks) {
      for (const stepId of Object.keys(pack.deviations)) {
        expect(coreSteps[stepId], `${pack.id} ทับขั้น ${stepId} ที่ไม่มีในแกนกลาง`).toBeDefined();
      }
    }
  });

  it("สกุลที่ไม่มีคู่มือชนิด ต้องมีชื่อไทยอย่างน้อยหนึ่งชื่อ ไม่งั้นคนไทยค้นไม่เจอ", () => {
    for (const pack of generaPacks) {
      expect(pack.commonNames.length, `${pack.id} ไม่มีชื่อเรียกทั่วไป`).toBeGreaterThan(0);
    }
  });

  it("ค้นด้วย id ได้ และคืน null เมื่อไม่มี", () => {
    expect(genusById("philodendron")?.id).toBe("philodendron");
    expect(genusById("ไม่มี")).toBeNull();
  });
});
