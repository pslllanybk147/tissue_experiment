import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { USER_REPORTED_PROFILE } from "@/lib/equipment/equipment-profile";
import { resolveBySlug } from "@/lib/manual/registry";
import { RoundSetup } from "./round-setup";

const manual = resolveBySlug("violin-variegated")!;

describe("RoundSetup", () => {
  it("แสดง NaDCC และ Haiter พร้อมกัน", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("NaDCC 60%");
    expect(html).toContain("Haiter / NaOCl");
    expect(html).toContain("ยกเลิกการเลือก");
    expect(html).toContain("cl-method-selector");
  });

  it("renders the approved four-stage workflow and one primary action", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("1 แนวทาง");
    expect(html).toContain("2 ข้อมูลสาร");
    expect(html).toContain("3 เลือกวิธี");
    expect(html).toContain("4 ตรวจทาน");
    expect((html.match(/cl-action-primary/g) ?? [])).toHaveLength(1);
  });

  it("ถามแนวทางของรอบเป็นอย่างแรก และไม่เลือกให้ล่วงหน้า", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("รอบนี้จะทำแนวไหน");
    expect(html).toContain("โหมดง่าย");
    expect(html).toContain("โหมดเก็บข้อมูล");
    // ไม่มี checked ในหมู่ตัวเลือกโหมด เพราะเป็นการตัดสินใจที่เดาแทนผู้ใช้ไม่ได้
    expect(html).not.toMatch(/name="roundMode"[^>]*checked/);
  });

  it("uses native grouped methods without nested legacy cards", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("<fieldset");
    expect(html).not.toContain('style="display:grid;grid-template-columns:auto 1fr auto');
    expect(html).not.toContain("pl-card");
  });

  it("ยังไม่ให้ยืนยันจนกว่าจะเลือกครบทุกหมวด", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("ยังไม่พร้อมยืนยัน");
    // ด่านแรกคือแนวทาง ข้อความจึงต้องชี้ที่สิ่งที่ยังขาดจริง ไม่ใช่หมวดวิธีที่ยังไปไม่ถึง
    expect(html).toContain("ต้องเลือกแนวทางของรอบนี้ก่อน");
    expect(html).toContain('disabled=""');
  });

  it("enables pressure sterilization when equipment capability exists", () => {
    const profile = structuredClone(USER_REPORTED_PROFILE);
    profile.owned = ["lab-autoclave", "heat-resistant-vessels"];
    const html = renderToStaticMarkup(
      <RoundSetup profile={profile} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain('data-method="pressure-sterilization"');
    expect(html).not.toContain("ยังไม่มีอุปกรณ์");
  });

  it("does not promise an R4 for chlorinated rinse", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).not.toMatch(/R4|final rinse|ล้างน้ำปลอดเชื้อ.*ต่อ/);
  });

  it("uses Botanical Atlas form sections and explicit unit controls", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("cl-atlas-form-section");
    expect(html).toContain("cl-atlas-field-grid");
    expect(html).toContain("cl-field-unit");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });
});
