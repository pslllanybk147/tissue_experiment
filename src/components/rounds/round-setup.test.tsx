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
});
