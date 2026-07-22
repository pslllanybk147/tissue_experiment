import type { ExperimentLot, Protocol, ResearchSource } from "@/lib/domain/models";
import type { LabRepository, LabSnapshot } from "./lab-repository";

const lots: Omit<ExperimentLot, "ownerId">[] = [
  { id: "PPP-001", plant: "Pink Princess", protocolId: "protocol-nodal-v01", protocolTitle: "Nodal establishment v0.1", stage: "รอตรวจวันที่ 14", status: "Healthy", startedAt: "2026-07-10", createdAt: "2026-07-10T00:00:00.000Z", updatedAt: "2026-07-10T00:00:00.000Z" },
  { id: "VIO-001", plant: "Violin variegated", protocolId: "protocol-nodal-v01", protocolTitle: "Nodal establishment v0.1", stage: "ลงอาหารแล้ว", status: "Review", startedAt: "2026-07-18", createdAt: "2026-07-18T00:00:00.000Z", updatedAt: "2026-07-18T00:00:00.000Z" },
  { id: "BLK-004", plant: "Philodendron green control", protocolId: "protocol-blank-v01", protocolTitle: "Sterility blank test", stage: "ผ่านวันที่ 7", status: "Healthy", startedAt: "2026-07-15", createdAt: "2026-07-15T00:00:00.000Z", updatedAt: "2026-07-15T00:00:00.000Z" },
];

const research: Omit<ResearchSource, "ownerId">[] = [
  { id: "L-PP-2023", title: "In Vitro Propagation of Philodendron erubescens ‘Pink Princess’", source: "Horticulturae · 2023", evidence: "Verified", note: "BAP 1.0 mg/L และ IBA 3.0 mg/L ในระบบ PLB/ยอดที่ตั้งตัวแล้ว" },
  { id: "L-CHERRY-2022", title: "Sterilization Methods for Philodendron ‘Cherry Red’", source: "Wichcha Journal · 2022", evidence: "Adapted", note: "มีการทดลอง Haiter แต่ต้องตรวจหน่วยและ active chlorine จาก PDF" },
  { id: "L-VIO-OPEN", title: "Violin variegated / P. bipennifolium", source: "Evidence gap", evidence: "Pending review", note: "ยังไม่พบงานตรงพันธุ์จากการค้นรอบแรก" },
];

export function createDemoLabRepository(): LabRepository {
  let activeStepIndex = 2;

  function protocolFor(ownerId: string): Protocol {
    return { id: "protocol-nodal-v01", ownerId, title: "Nodal establishment", version: "v0.1", activeStepIndex, stepCount: 6 };
  }

  async function listLots(ownerId: string): Promise<ExperimentLot[]> {
    return lotsFor(ownerId);
  }

  async function getSnapshot(ownerId: string): Promise<LabSnapshot> {
    return createDemoSnapshot(ownerId, activeStepIndex);
  }

  async function completeProtocolStep(ownerId: string, protocolId: string, currentIndex: number): Promise<Protocol> {
    if (protocolId !== "protocol-nodal-v01") throw new Error("Unknown protocol");
    activeStepIndex = Math.min(Math.max(currentIndex + 1, 0), 5);
    return protocolFor(ownerId);
  }

  return { getSnapshot, listLots, completeProtocolStep };
}

export function createDemoSnapshot(ownerId: string, activeStepIndex = 2): LabSnapshot {
  return {
    lots: lotsFor(ownerId),
    protocol: { id: "protocol-nodal-v01", ownerId, title: "Nodal establishment", version: "v0.1", activeStepIndex, stepCount: 6 },
    research: research.map((source) => ({ ...source, ownerId })),
  };
}

function lotsFor(ownerId: string): ExperimentLot[] {
  return lots.map((lot) => ({ ...lot, ownerId }));
}
