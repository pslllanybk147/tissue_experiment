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
    expect(html).toContain("pl-choice-tag");
  });

  it("ยังไม่ให้ยืนยันจนกว่าจะเลือกครบทุกหมวด", () => {
    const html = renderToStaticMarkup(
      <RoundSetup profile={USER_REPORTED_PROFILE} manual={manual} onConfirm={() => {}} onBack={() => {}} />,
    );

    expect(html).toContain("ยังไม่พร้อมยืนยัน");
    expect(html).toContain("ต้องเลือกให้ครบทุกหมวด");
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
});
