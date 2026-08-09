import { describe, expect, it } from "vitest";
import { resolveBySlug } from "@/lib/manual/registry";
import { NADCC_VS_HAITER_TRIAL_ARM_COUNT, buildNaDccVsHaiterTrialLotInputs } from "./nadcc-vs-haiter-trial";

const manual = resolveBySlug("violin-variegated")!;

describe("buildNaDccVsHaiterTrialLotInputs", () => {
  it("สร้างห้าแขนงตามหัวข้อ 15 ของ new_idea.md รวม T3", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");

    expect(inputs).toHaveLength(NADCC_VS_HAITER_TRIAL_ARM_COUNT);
    expect(inputs.map((input) => input.armRole)).toEqual(["control-a", "control-b", "t1", "t2", "t3"]);
  });

  it("ทุกแขนงใช้ trialId เดียวกันเพื่อให้หน้าภาพรวมค้นกลุ่มได้", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");
    const trialIds = new Set(inputs.map((input) => input.trialId));

    expect(trialIds.size).toBe(1);
  });

  it("Control-B เป็นกระปุกเปล่า ไม่มี explant", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");
    const controlB = inputs.find((input) => input.armRole === "control-b")!;

    expect(controlB.isBlank).toBe(true);
    expect(controlB.stage).toBe("blank-prepare");
    expect(controlB.armLabel).toBe("Control-B · กระปุกเปล่า ไม่มีวัสดุพืช");
  });

  it("Control-A ไม่ตั้งค่าน้ำ rinse พิเศษ ใช้เส้นทางเดิมของระบบ", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");
    const controlA = inputs.find((input) => input.armRole === "control-a")!;

    expect(controlA.sterilization).toBeUndefined();
  });

  it("T1 ใช้น้ำ rinse NaClO และ T2 ใช้ NaDCC ที่ความเข้มข้นออกฤทธิ์เท่ากัน 300 ppm (0.03%)", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");
    const t1 = inputs.find((input) => input.armRole === "t1")!;
    const t2 = inputs.find((input) => input.armRole === "t2")!;

    expect(t1.sterilization?.rinseWater?.method).toBe("low-dose-hypochlorite");
    expect(t2.sterilization?.rinseWater?.method).toBe("nadcc");
    expect(t1.sterilization?.rinseWater?.status).toBe("planned");
    expect(t2.sterilization?.rinseWater?.status).toBe("planned");
    expect(t1.sterilization?.rinseWater?.targetChlorinePercent).toBe(0.03);
    expect(t2.sterilization?.rinseWater?.targetChlorinePercent).toBe(0.03);
  });

  it("คัดลอกหลักฐาน rinse ที่เตรียมจริงจาก equipment profile ลง lot T1/T2", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09", 50, undefined, {
      lowDoseHypochlorite: {
        method: "low-dose-hypochlorite",
        status: "prepared",
        containerCount: 3,
        volumePerContainerMl: 50,
        productName: "Haiter",
        batchOrLot: "H-1",
        actualChlorinePpm: 300,
        stockVolumeMl: 5,
        finalVolumeMl: 1000,
        preparedAt: "2026-08-09",
      },
      nadcc: {
        method: "nadcc",
        status: "prepared",
        containerCount: 3,
        volumePerContainerMl: 50,
        productName: "NaDCC",
        batchOrLot: "N-1",
        actualChlorinePpm: 300,
        stockVolumeMl: 1,
        finalVolumeMl: 1000,
        preparedAt: "2026-08-09",
      },
    });

    expect(inputs.find((input) => input.armRole === "t1")?.sterilization?.rinseWater?.status).toBe("prepared");
    expect(inputs.find((input) => input.armRole === "t2")?.sterilization?.rinseWater?.batchOrLot).toBe("N-1");
  });

  it("T3 ใช้ NaDCC เดี่ยวแทน Haiter ทั้งขั้น จึงไม่มี rinseWater เสริม", () => {
    const inputs = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09");
    const t3 = inputs.find((input) => input.armRole === "t3")!;

    expect(t3.sterilization?.method).toBe("nadcc-soak");
    expect(t3.sterilization?.targetChlorinePercent).toBe(0.03);
    expect(t3.sterilization?.rinseWater).toBeUndefined();
    expect(t3.isBlank).toBe(false);
  });
});

it("snapshot จำนวนกระปุกจาก design เดียวกันลงทุกแขน", () => {
  const allocations = { "control-a": 9, "control-b": 9, t1: 9, t2: 9, t3: 9 } as const;
  const lots = buildNaDccVsHaiterTrialLotInputs(manual, "2026-08-09", 50, { total: 46, reserved: 1, allocations });

  expect(lots.map((lot) => [lot.armRole, lot.plannedContainerCount])).toEqual([
    ["control-a", 9], ["control-b", 9], ["t1", 9], ["t2", 9], ["t3", 9],
  ]);
  expect(lots.every((lot) => lot.trialContainerPlan?.total === 46 && lot.trialContainerPlan.reserved === 1)).toBe(true);
});
