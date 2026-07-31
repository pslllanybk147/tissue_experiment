import { describe, expect, it } from "vitest";

import type { ExperimentLot } from "./models";
import {
  buildPinkPrincessHaiterProtocolV2,
  canRunGuidedProtocolV2,
  containsVagueInstruction,
} from "./guided-protocol-v2";

const lot: ExperimentLot = {
  id: "LOT-V2-1",
  ownerId: "owner-1",
  plant: "Pink Princess",
  protocolId: "protocol-pink-princess-nodal",
  protocolTitle: "Pink Princess · Nodal culture",
  protocolVersionId: "version-1",
  stage: "Establishment",
  status: "Healthy",
  startedAt: "2026-07-31",
  createdAt: "2026-07-31T00:00:00.000Z",
  updatedAt: "2026-07-31T00:00:00.000Z",
  taxonId: "cultivar-pink-princess",
  sterilization: {
    profileId: "haiter-chemical-v1",
    profileVersion: "1.0.0",
    method: "haiter-chemical",
    activeChlorinePercent: 6,
    targetChlorinePercent: 0.003,
    mediumVolumeMl: 110,
    minimumToolVolumeMl: 0.1,
  },
  workflowVersion: "v2",
};

describe("Pink Princess Haiter beginner protocol v2", () => {
  it("contains exactly fourteen major steps in the approved order", () => {
    const steps = buildPinkPrincessHaiterProtocolV2(lot);

    expect(steps.map((step) => step.title)).toEqual([
      "ตรวจต้นแม่และสุขภาพ",
      "หาและทำเครื่องหมายข้อกับตาข้าง",
      "กำหนดจำนวนชิ้นพืชและกระปุก",
      "เตรียมน้ำ น้ำยา และสารละลายตั้งต้น",
      "ฆ่าเชื้อกระปุกและฝา",
      "เตรียมอาหาร",
      "เติม Haiter ลงในอาหาร",
      "รอตรวจ Blank 48 ชั่วโมง",
      "ล้างต้นแม่และเตรียมชิ้นส่วน",
      "เตรียมกล่องปลอดเชื้อและเครื่องมือ",
      "ตัดชิ้นพืชก่อนฟอก",
      "ฟอกผิวชิ้นพืชและล้าง",
      "ตัดแต่ง ลงอาหาร และปิดภาชนะ",
      "ตรวจการปนเปื้อนและการตั้งตัว",
    ]);
  });

  it("does not require new protocol photos", () => {
    const steps = buildPinkPrincessHaiterProtocolV2(lot);

    expect(steps.every((step) => step.allowPhoto === false)).toBe(true);
    expect(steps.flatMap((step) => step.requiredEvidence ?? [])).not.toContain("photo");
  });

  it("provides direct actions without vague protocol placeholders", () => {
    const steps = buildPinkPrincessHaiterProtocolV2(lot);
    const instructions = steps.flatMap((step) => [
      step.instruction,
      ...(step.beginner?.actions ?? []),
    ]);

    expect(instructions.filter(containsVagueInstruction)).toEqual([]);
  });

  it("uses the saved Lot values in the chemical-food steps", () => {
    const steps = buildPinkPrincessHaiterProtocolV2(lot);
    const text = steps
      .slice(3, 8)
      .flatMap((step) => step.beginner?.actions ?? [])
      .join(" ");

    expect(text).toContain("110 mL");
    expect(text).toContain("6%");
    expect(text).toContain("0.003%");
    expect(text).toContain("48 ชั่วโมง");
  });

  it("turns the surface-sterilization target into exact mixing instructions", () => {
    const surfaceStep = buildPinkPrincessHaiterProtocolV2(lot)
      .find((step) => step.id === "v2-surface-sterilize");
    const text = surfaceStep?.beginner?.actions.join(" ") ?? "";

    expect(text).toContain("ตวง Haiter จากขวด 10.00 mL");
    expect(text).toContain("เติมน้ำปลอดเชื้อ 90.00 mL");
    expect(text).toContain("active chlorine 0.6%");
  });

  it("only runs v2 for a Pink Princess Haiter Lot explicitly created as v2", () => {
    expect(canRunGuidedProtocolV2(lot)).toBe(true);
    expect(canRunGuidedProtocolV2({ ...lot, workflowVersion: undefined })).toBe(false);
    expect(canRunGuidedProtocolV2({ ...lot, taxonId: "trade-name-violin-variegated" })).toBe(false);
    expect(canRunGuidedProtocolV2({
      ...lot,
      sterilization: { ...lot.sterilization!, method: "pressure-sterilization" },
    })).toBe(false);
  });
});
