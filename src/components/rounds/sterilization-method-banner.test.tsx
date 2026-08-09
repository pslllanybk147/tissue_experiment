import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SterilizationMethodBanner } from "./sterilization-method-banner";

describe("SterilizationMethodBanner", () => {
  it("ไม่แสดงอะไรเมื่อรอบนี้ไม่ได้เป็นแขนงของชุดทดลอง (ไม่มี sterilization)", () => {
    expect(renderToStaticMarkup(<SterilizationMethodBanner sterilization={undefined} />)).toBe("");
  });

  it("แสดงข้อความข้าม Haiter เมื่อ method เป็น nadcc-soak (T3)", () => {
    const html = renderToStaticMarkup(
      <SterilizationMethodBanner
        sterilization={{ profileId: "nadcc-soak-v1", profileVersion: "1.0.0", method: "nadcc-soak", targetChlorinePercent: 0.03 }}
      />,
    );

    expect(html).toContain("ข้ามขั้น Haiter ทั้งขั้น");
    expect(html).toContain("24 ถึง 48 ชั่วโมง");
    expect(html).toContain("<details");
  });

  it("แสดงข้อความ rinse เสริมเมื่อมี rinseWater แบบ NaDCC", () => {
    const html = renderToStaticMarkup(
      <SterilizationMethodBanner
        sterilization={{
          profileId: "haiter-chemical-v1",
          profileVersion: "1.0.0",
          method: "haiter-chemical",
          rinseWater: { method: "nadcc", containerCount: 3, volumePerContainerMl: 50, targetChlorinePercent: 0.03 },
        }}
      />,
    );

    expect(html).toContain("ขั้นทดลองเสริมหลังฟอก");
    expect(html).toContain("NaDCC");
    expect(html).toContain("R1–R3");
    expect(html).toContain("ไม่ใช่น้ำปลอดเชื้อ");
  });

  it("แสดงข้อความ rinse เสริมเมื่อมี rinseWater แบบ NaClO", () => {
    const html = renderToStaticMarkup(
      <SterilizationMethodBanner
        sterilization={{
          profileId: "haiter-chemical-v1",
          profileVersion: "1.0.0",
          method: "haiter-chemical",
          rinseWater: { method: "low-dose-hypochlorite", containerCount: 3, volumePerContainerMl: 50, targetChlorinePercent: 0.03 },
        }}
      />,
    );

    expect(html).toContain("NaClO");
    expect(html).toContain("R1–R3");
  });

  it("ไม่แสดงอะไรสำหรับ Control-A ที่มี sterilization แต่ไม่มี rinseWater พิเศษ", () => {
    const html = renderToStaticMarkup(
      <SterilizationMethodBanner
        sterilization={{ profileId: "haiter-chemical-v1", profileVersion: "1.0.0", method: "haiter-chemical" }}
      />,
    );

    expect(html).toBe("");
  });
});
