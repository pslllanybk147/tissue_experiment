import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE, type EquipmentProfileV2 } from "./equipment-profile";
import { resolveTrialReadiness } from "./trial-readiness";

function profile(overrides: (draft: EquipmentProfileV2) => void): EquipmentProfileV2 {
  const draft = structuredClone(USER_REPORTED_PROFILE);
  overrides(draft);
  return draft;
}

describe("resolveTrialReadiness ต้องพูดตรงกับโปรไฟล์เสมอ", () => {
  it("ไม่บอกว่าแอลกอฮอล์เป็น 75% เมื่อผู้ใช้บันทึกไว้ 70%", () => {
    const readiness = resolveTrialReadiness(profile((draft) => { draft.chemicals.alcohol.percent = 70; }));
    const tools = readiness.capabilities.find((item) => item.id === "sterile-tools")!;

    expect(tools.have).toContain("70%");
    expect(tools.missing).not.toContain("75%");
  });

  it("การ์ดที่พร้อมแล้วต้องไม่บอกว่ายังขาดอะไร", () => {
    const readiness = resolveTrialReadiness(profile((draft) => {
      draft.water.sterile = true;
      draft.water.sterilizationMethod = "ต้มเดือดในภาชนะมีฝา";
    }));
    const water = readiness.capabilities.find((item) => item.id === "sterile-water")!;

    expect(water.status).toBe("ready");
    expect(water.missing).toBe("");
    expect(water.have).toContain("ต้มเดือดในภาชนะมีฝา");
  });

  it("มีแค่ Haiter ก็เริ่มฟอกผิวได้ ไม่ต้องมี NaDCC ครบสองสาร", () => {
    const readiness = resolveTrialReadiness(profile((draft) => {
      draft.chemicals.nadcc.availableChlorinePercent = 0;
    }));
    const surface = readiness.capabilities.find((item) => item.id === "surface-decontam")!;

    expect(surface.status).toBe("experimental");
    expect(surface.have).not.toContain("NaDCC");
  });

  it("ไม่อ้างว่ามีเตาแก๊สหรือห้องพลาสติกเมื่อไม่ได้บันทึกไว้", () => {
    const readiness = resolveTrialReadiness(profile((draft) => {
      draft.workspace.plasticRoom = false;
      draft.inventory = draft.inventory.map((item) => item.id === "picnic-gas-stove" ? { ...item, quantity: 0 } : item);
    }));

    expect(readiness.capabilities.find((item) => item.id === "sterile-tools")!.have).not.toContain("เตาแก๊ส");
    expect(readiness.capabilities.find((item) => item.id === "clean-workspace")!.have).not.toContain("ห้องพลาสติก");
  });

  it("ไม่เตือนเรื่องตะเกียงไม่มีเชื้อเพลิงเมื่อเติมเชื้อเพลิงแล้ว", () => {
    const readiness = resolveTrialReadiness(profile((draft) => {
      draft.workspace.openFlameFuelAvailable = true;
    }));

    expect(readiness.cautions.some((item) => item.includes("ไม่มีเชื้อเพลิง"))).toBe(false);
  });
});
