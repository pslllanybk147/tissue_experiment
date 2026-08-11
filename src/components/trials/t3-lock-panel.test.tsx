import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { T3Eligibility } from "@/lib/trials/t3-eligibility";
import { canSubmitT3Override, T3LockPanel } from "./t3-lock-panel";

const locked: T3Eligibility = {
  unlocked: false,
  reason: "missing-results",
  missing: ["t1:container-clean", "t2:result-run"],
};

describe("canSubmitT3Override", () => {
  it("ต้องยืนยันและกรอกเหตุผลอย่างน้อย 20 ตัวอักษรหลัง trim", () => {
    expect(canSubmitT3Override(false, "ต้องการทดสอบหลังประเมินความเสี่ยงครบแล้ว")).toBe(false);
    expect(canSubmitT3Override(true, "สั้นเกินไป")).toBe(false);
    expect(canSubmitT3Override(true, "  ต้องการทดสอบหลังประเมินความเสี่ยงครบแล้ว  ")).toBe(true);
  });
});

describe("T3LockPanel", () => {
  it("ใช้ notice และ action ของ Botanical Atlas โดยไม่แสดงคำกำกับแบบ mockup", () => {
    const html = renderToStaticMarkup(<T3LockPanel eligibility={locked} demoMode={false} onOverride={async () => {}} />);

    expect(html).toContain("cl-status-notice");
    expect(html).toContain("cl-button-danger");
    expect(html).not.toMatch(/Primary|Keyboard focus|Destructive|Disabled/);
  });

  it("อธิบายผลที่ยังขาดและปิดปุ่ม override ในค่าเริ่มต้น", () => {
    const html = renderToStaticMarkup(<T3LockPanel eligibility={locked} demoMode={false} onOverride={async () => {}} />);

    expect(html).toContain("T1 · จำนวนกระปุกไม่ติดเชื้อ");
    expect(html).toContain("T2 · ยังไม่ได้บันทึกขั้นตรวจการปนเปื้อน");
    expect(html).toContain("disabled");
  });

  it("เปิดปุ่มเมื่อ initial state ผ่านกฎ ใช้สำหรับยืนยัน SSR และ regression", () => {
    const html = renderToStaticMarkup(
      <T3LockPanel
        eligibility={locked}
        demoMode={false}
        onOverride={async () => {}}
        initialAcknowledged
        initialReason="ต้องการทดสอบหลังประเมินความเสี่ยงครบแล้ว"
      />,
    );

    const button = html.slice(html.lastIndexOf("<button"), html.indexOf("ยืนยันและปลดล็อก"));
    expect(button).not.toContain("disabled");
  });

  it("ติดป้าย demo-only ชัดเจนในโหมดสาธิต", () => {
    const html = renderToStaticMarkup(<T3LockPanel eligibility={locked} demoMode onOverride={async () => {}} />);

    expect(html).toContain("demo-only");
    expect(html).toContain("ไม่ถูกนับเป็นผลทดลองจริง");
  });

  it("ยังติดป้าย demo-only หลังปลดล็อกในโหมดสาธิต", () => {
    const html = renderToStaticMarkup(
      <T3LockPanel
        eligibility={{ ...locked, unlocked: true, reason: "override", missing: [] }}
        demoMode
        onOverride={async () => {}}
      />,
    );

    expect(html).toContain("T3 ปลดล็อกแล้ว");
    expect(html).toContain("demo-only");
    expect(html).toContain("ไม่ถูกนับเป็นผลทดลองจริง");
  });
});
