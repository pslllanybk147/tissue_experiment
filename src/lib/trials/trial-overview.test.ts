import { describe, expect, it } from "vitest";
import type { ExperimentLot, Observation } from "@/lib/domain/models";
import { buildTrialOverview } from "./trial-overview";

function lot(overrides: Partial<ExperimentLot>): ExperimentLot {
  return {
    id: "lot-1",
    ownerId: "owner-1",
    plant: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
    protocolId: "violin-variegated",
    protocolTitle: "Philodendron bipennifolium 'Violin' variegated",
    stage: "sterilize",
    status: "Healthy",
    startedAt: "2026-08-09",
    createdAt: "2026-08-09T00:00:00.000Z",
    updatedAt: "2026-08-09T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildTrialOverview", () => {
  it("เรียงแขนงตามลำดับ Control-A, Control-B, T1, T2 ไม่ใช่ตามลำดับที่ส่งเข้ามา", () => {
    const lots = [
      lot({ id: "lot-t1", armRole: "t1", armLabel: "T1" }),
      lot({ id: "lot-cb", armRole: "control-b", armLabel: "Control-B", isBlank: true }),
      lot({ id: "lot-ca", armRole: "control-a", armLabel: "Control-A" }),
      lot({ id: "lot-t2", armRole: "t2", armLabel: "T2" }),
    ];

    const overview = buildTrialOverview(lots, new Map());

    expect(overview.map((item) => item.armRole)).toEqual(["control-a", "control-b", "t1", "t2"]);
  });

  it("แสดงชื่อวิธี rinse ตาม method ที่ตั้งไว้ และใช้ค่าเริ่มต้นเมื่อไม่ได้ตั้งเป็นพิเศษ", () => {
    const lots = [
      lot({ id: "lot-ca", armRole: "control-a", armLabel: "Control-A" }),
      lot({
        id: "lot-t1",
        armRole: "t1",
        armLabel: "T1",
        sterilization: {
          profileId: "haiter-chemical-v1",
          profileVersion: "1.0.0",
          method: "haiter-chemical",
          rinseWater: { method: "low-dose-hypochlorite", containerCount: 3, volumePerContainerMl: 50 },
        },
      }),
    ];

    const overview = buildTrialOverview(lots, new Map());

    expect(overview.find((item) => item.armRole === "control-a")?.methodLabel).toBe("Haiter + น้ำปลอดเชื้อธรรมดา (ค่าเริ่มต้นของระบบ)");
    expect(overview.find((item) => item.armRole === "t1")?.methodLabel).toBe("Haiter + น้ำ rinse NaClO 300 ppm");
  });

  it("T3 แสดงว่าเปลี่ยนวิธีฆ่าเชื้อหลักเป็น NaDCC เดี่ยว ไม่ใช่แค่เสริม rinse", () => {
    const lots = [
      lot({
        id: "lot-t3",
        armRole: "t3",
        armLabel: "T3",
        sterilization: { profileId: "nadcc-soak-v1", profileVersion: "1.0.0", method: "nadcc-soak", targetChlorinePercent: 0.03 },
      }),
    ];

    const overview = buildTrialOverview(lots, new Map());

    expect(overview[0].methodLabel).toBe("NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. (แทน Haiter ทั้งขั้น)");
  });

  it("Control-B อธิบาย blank workflow โดยไม่อ้างการฟอกผิวด้วย Haiter", () => {
    const overview = buildTrialOverview([
      lot({ id: "lot-cb", armRole: "control-b", armLabel: "Control-B", isBlank: true, stage: "blank-prepare" }),
    ], new Map());

    expect(overview[0].methodLabel).toBe("Blank control · อาหารและกระปุกเปล่า ไม่มีการฟอกผิว");
    expect(overview[0].stage).toBe("blank-prepare");
  });

  it("ดึงบันทึกล่าสุดของแต่ละ lot มาแสดง โดยถือว่า observations ที่ส่งเข้ามาเรียงใหม่ไปเก่าแล้ว", () => {
    const lots = [lot({ id: "lot-ca", armRole: "control-a", armLabel: "Control-A" })];
    const observations = new Map<string, Observation[]>([
      [
        "lot-ca",
        [
          {
            id: "obs-2",
            lotId: "lot-ca",
            ownerId: "owner-1",
            createdBy: "owner-1",
            createdAt: "2026-08-09T10:00:00.000Z",
            updatedAt: "2026-08-09T10:00:00.000Z",
            deletedAt: null,
            observedAt: "2026-08-09T10:00:00.000Z",
            status: "Healthy",
            stage: "sterilize",
            note: "ล่าสุด ยังไม่เห็นปนเปื้อน",
            shootCount: null,
            rootCount: null,
            contaminationCount: 0,
          },
          {
            id: "obs-1",
            lotId: "lot-ca",
            ownerId: "owner-1",
            createdBy: "owner-1",
            createdAt: "2026-08-08T10:00:00.000Z",
            updatedAt: "2026-08-08T10:00:00.000Z",
            deletedAt: null,
            observedAt: "2026-08-08T10:00:00.000Z",
            status: "Healthy",
            stage: "sterilize",
            note: "บันทึกแรก",
            shootCount: null,
            rootCount: null,
            contaminationCount: 0,
          },
        ],
      ],
    ]);

    const overview = buildTrialOverview(lots, observations);

    expect(overview[0].latestObservationNote).toBe("ล่าสุด ยังไม่เห็นปนเปื้อน");
  });

  it("lot ที่ยังไม่มีบันทึกเลยได้ null ไม่ใช่ throw", () => {
    const lots = [lot({ id: "lot-cb", armRole: "control-b", armLabel: "Control-B", isBlank: true })];

    const overview = buildTrialOverview(lots, new Map());

    expect(overview[0].latestObservationNote).toBeNull();
    expect(overview[0].isBlank).toBe(true);
  });
});
