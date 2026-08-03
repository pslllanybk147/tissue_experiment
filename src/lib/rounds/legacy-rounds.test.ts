import { describe, expect, it } from "vitest";
import type { ExperimentLot } from "@/lib/domain/models";
import { partitionLots } from "./legacy-rounds";

const lot = (id: string, protocolId: string): ExperimentLot => ({
  id,
  ownerId: "owner-1",
  plant: "ต้นทดสอบ",
  protocolId,
  protocolTitle: "ชื่อเดิม",
  stage: "receive",
  status: "Healthy",
  startedAt: "2026-07-01",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
});

describe("partitionLots", () => {
  it("แยกรอบที่คู่มือใหม่รองรับ ออกจากรอบเก่าที่เดินด้วยระบบเดิม", () => {
    const { current, legacy } = partitionLots([
      lot("a", "pink-princess"),
      lot("b", "protocol-pink-princess-nodal"),
    ]);

    expect(current.map((item) => item.id)).toEqual(["a"]);
    expect(legacy.map((item) => item.id)).toEqual(["b"]);
  });

  it("รอบเก่าต้องไม่หายไปเฉย ๆ แม้คู่มือใหม่จะไม่รู้จัก", () => {
    const { current, legacy } = partitionLots([lot("b", "ไม่รู้จักเลย")]);

    expect(current).toHaveLength(0);
    expect(legacy).toHaveLength(1);
  });

  it("ไม่มีอะไรเลยก็ไม่พัง", () => {
    expect(partitionLots([])).toEqual({ current: [], legacy: [] });
  });
});
