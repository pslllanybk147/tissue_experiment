import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { PreparationSummary } from "./preparation-summary";

describe("PreparationSummary", () => {
  it("distinguishes planned setup values from prepared evidence", () => {
    const html = renderToStaticMarkup(
      <PreparationSummary
        value={{
          manualName: "ฟิโลเดนดรอน",
          profile: USER_REPORTED_PROFILE,
          selection: { mediumMethod: "haiter-chemical", surfaceMethod: null, rinseMethod: null },
        }}
      />,
    );

    expect(html).toContain("สรุปสำหรับตรวจทาน");
    expect(html).toContain("ค่าที่วางแผน");
    expect(html).toContain("ยังไม่ใช่หลักฐานว่าเตรียมจริง");
    expect(html).toContain("Haiter");
  });
});
