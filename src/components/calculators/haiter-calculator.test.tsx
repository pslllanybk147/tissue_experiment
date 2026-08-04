import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HaiterCalculator } from "./haiter-calculator";

describe("HaiterCalculator", () => {
  it("โหมดคำนวณตรง: ตวงได้พอดีไม่มีคำเตือน (6% เจือจางเหลือ 1% ใน 100mL ตวงขั้นต่ำ 1mL)", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("16.666667 mL");
    expect(html).not.toContain("ไปทำ working dilution");
  });

  it("โหมดคำนวณตรง: เตือนให้ทำ working dilution เมื่อโดสต่ำกว่าตวงได้ (target 0.05% final 10mL)", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialDoseInput={{ targetPercent: 0.05, finalVolumeMl: 10 }} />,
    );

    expect(html).toContain("วัดไม่ได้อย่างน่าเชื่อถือ");
    expect(html).toContain("ไปทำ working dilution");
  });

  it("โหมดคำนวณตรง: โชว์การ์ดเตือนเมื่อ target มากกว่าหรือเท่ากับ source", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialDoseInput={{ sourcePercent: 1, targetPercent: 2 }} />);

    expect(html).toContain("target concentration ต้องต่ำกว่า source concentration");
  });

  it("โหมด working dilution: คำนวณสำเร็จไม่มีคำเตือน (ค่าเริ่มต้น)", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialMode="working-dilution" />);

    expect(html).toContain("working stock 0.6%");
    expect(html).toContain("ตวงต้นทาง 10 mL");
    expect(html).toContain("เติมน้ำ 90 mL");
  });

  it("โหมด working dilution: โชว์คำเตือนเมื่อโดสยังตวงไม่ได้ (target 0.001% final 1mL)", () => {
    // targetPercent/finalVolumeMl เป็น state ที่ใช้ร่วมกันทั้งสองโหมด ตั้งต้นจาก initialDoseInput เสมอ
    // (initialDilutionInput ตั้งต้นให้เฉพาะ dilutionFactor/workingVolumeMl)
    const html = renderToStaticMarkup(
      <HaiterCalculator initialMode="working-dilution" initialDoseInput={{ targetPercent: 0.001, finalVolumeMl: 1 }} />,
    );

    expect(html).toContain("ยังต่ำกว่าเครื่องมือขั้นต่ำ");
  });

  it("โหมด working dilution: โชว์การ์ดเตือนเมื่อ dilution factor ไม่มากกว่า 1", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialMode="working-dilution" initialDilutionInput={{ dilutionFactor: 1 }} />,
    );

    expect(html).toContain("dilution factor ต้องมากกว่า 1");
  });
});
