import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { resolveTrialReadiness } from "@/lib/equipment/trial-readiness";
import { ReadinessGate } from "./readiness-gate";

const noop = () => {};

describe("ReadinessGate", () => {
  it("ระหว่างโหลดและเมื่อถูกบล็อก ปุ่มเริ่มต้องปิด", () => {
    const loading = renderToStaticMarkup(<ReadinessGate loading readiness={null} starting={false} confirmed={false} onConfirmed={noop} onStart={noop} />);
    const blocked = renderToStaticMarkup(<ReadinessGate loading={false} readiness={resolveTrialReadiness(USER_REPORTED_PROFILE)} starting={false} confirmed={false} onConfirmed={noop} onStart={noop} />);

    expect(loading).toContain("กำลังตรวจอุปกรณ์");
    expect(loading).toContain("disabled");
    expect(blocked).toContain("น้ำ 15 ppm ยังไม่ใช่น้ำปลอดเชื้อ");
    expect(blocked).toContain('href="/my/equipment"');
    expect(blocked.slice(blocked.lastIndexOf("<button"))).toContain("disabled");
  });

  it("สถานะทดลองต้องยืนยันก่อน และระหว่างสร้างป้องกันการกดซ้ำ", () => {
    const experimentalProfile = {
      ...USER_REPORTED_PROFILE,
      water: { sourcePpm: 15, sterile: true, sterilizationMethod: "นึ่งด้วยหม้ออัดแรงดัน" },
      medium: { ...USER_REPORTED_PROFILE.medium, sterilizationMethod: "nadcc-chemical" as const },
      rinseWater: {
        lowDoseHypochlorite: {
          method: "low-dose-hypochlorite" as const, status: "prepared" as const, containerCount: 3 as const,
          volumePerContainerMl: 50, productName: "Haiter", batchOrLot: "H-1", actualChlorinePpm: 300,
          stockVolumeMl: 5, finalVolumeMl: 1000, preparedAt: "2026-08-09",
        },
        nadcc: {
          method: "nadcc" as const, status: "prepared" as const, containerCount: 3 as const,
          volumePerContainerMl: 50, productName: "NaDCC", batchOrLot: "N-1", actualChlorinePpm: 300,
          stockVolumeMl: 1, finalVolumeMl: 1000, preparedAt: "2026-08-09",
        },
      },
    };
    const readiness = resolveTrialReadiness(experimentalProfile);
    const unchecked = renderToStaticMarkup(<ReadinessGate loading={false} readiness={readiness} starting={false} confirmed={false} onConfirmed={noop} onStart={noop} />);
    const checked = renderToStaticMarkup(<ReadinessGate loading={false} readiness={readiness} starting={false} confirmed onConfirmed={noop} onStart={noop} />);
    const starting = renderToStaticMarkup(<ReadinessGate loading={false} readiness={readiness} starting confirmed onConfirmed={noop} onStart={noop} />);

    expect(readiness.overall).toBe("experimental");
    expect(unchecked).toContain("ยอมรับว่าวิธีนี้เป็นการทดลอง");
    expect(unchecked.slice(unchecked.lastIndexOf("<button"))).toContain("disabled");
    expect(checked.slice(checked.lastIndexOf("<button"))).not.toContain("disabled");
    expect(starting.slice(starting.lastIndexOf("<button"))).toContain("disabled");
    expect(unchecked).toContain("Control-A");
    expect(unchecked).toContain("T1");
    expect(unchecked).toContain("T2");
    expect(unchecked).toContain("T3");
  });
});
