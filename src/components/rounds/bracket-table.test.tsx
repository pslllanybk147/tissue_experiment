import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { CalibrationEntry } from "@/lib/domain/calibration";
import type { Dose } from "@/lib/manual/forms/types";
import { bracketKey, jarsPerArmKey, type BracketPlan } from "@/lib/rounds/bracket";
import { BracketTable } from "./bracket-table";

const dose: Dose = {
  form: "น้ำยาซักผ้าขาว NaOCl 6%",
  low: 0.8,
  high: 2,
  unit: "%",
  durationMin: [10, 20],
  movesLowerWhen: [],
  movesHigherWhen: [],
  evidence: { level: "adapted", sourceIds: ["source-pp-2023"] },
};

const plan: BracketPlan = {
  doseKey: "sterilize.dose",
  dose,
  arms: [
    { armId: "a", dose: 0.8 },
    { armId: "b", dose: 1.4 },
    { armId: "c", dose: 2 },
  ],
};

const remembered: CalibrationEntry = {
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

describe("ตารางกรอกผลทดสอบช่วง", () => {
  const html = renderToStaticMarkup(<BracketTable plan={plan} saved={{}} remembered={null} />);

  it("มีช่องกรอกครบทุกชุดและทุกช่อง โดยชื่อมาจากฟังก์ชันสร้างคีย์", () => {
    for (const armId of ["a", "b", "c"] as const) {
      for (const field of ["clean", "alive", "usable"] as const) {
        expect(html, `ไม่มีช่อง ${armId}/${field}`).toContain(`name="${bracketKey(armId, field)}"`);
      }
    }
    expect(html).toContain(`name="${jarsPerArmKey()}"`);
  });

  it("ไม่มีช่องให้กรอกความเข้มข้น เพราะระบบเป็นคนกำหนด", () => {
    expect(html).not.toContain(`name="${bracketKey("a", "dose")}"`);
  });

  it("เขียนนิยามของแต่ละช่องไว้ ไม่ให้ผู้ใช้เดา", () => {
    expect(html).toContain("ไม่มีเมือก");
    expect(html).toContain("ทั้งสองข้อพร้อมกัน");
  });

  it("เติมค่าที่เคยบันทึกไว้กลับเข้าช่อง", () => {
    const filled = renderToStaticMarkup(
      <BracketTable plan={plan} saved={{ [bracketKey("b", "usable")]: 3 }} remembered={null} />,
    );
    expect(filled).toContain('value="3"');
  });

  it("ค่าที่เคยทดสอบได้ ต้องไม่ยกระดับหลักฐานของขั้น", () => {
    // การทดลองของผู้ใช้คนเดียวไม่ใช่งานที่ผ่านการทบทวน ระบบจำสิ่งที่ผู้ใช้พบ
    // ไม่ได้เปลี่ยนสิ่งที่ระบบอ้าง เทสต์นี้กันไม่ให้ใครเผลอเชื่อมสองอย่างนี้เข้าด้วยกัน
    const withMemory = renderToStaticMarkup(
      <BracketTable plan={plan} saved={{}} remembered={remembered} />,
    );
    expect(withMemory).not.toContain("ระดับหลักฐาน");
    expect(withMemory).not.toContain("ตรงพันธุ์");
  });

  it("แสดงค่าที่เคยทดสอบได้พร้อมคำเตือนว่าไม่ใช่ข้อพิสูจน์", () => {
    const withMemory = renderToStaticMarkup(
      <BracketTable plan={plan} saved={{}} remembered={remembered} />,
    );
    expect(withMemory).toContain("1.4");
    expect(withMemory).toContain("ไม่ใช่ข้อพิสูจน์");
  });
});
