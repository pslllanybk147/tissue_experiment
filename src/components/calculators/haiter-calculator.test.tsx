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

  // ค่าเริ่มต้น (ต้นทาง 6% เจือจาง 10 เท่า เป้าหมาย 1%) เป็นกรณีที่ทำตามไม่ได้จริง
  // เพราะ working stock 0.6% อ่อนกว่าเป้าหมาย 1% ระบบเคยตอบว่าให้ตวง 166.666667 mL
  // ลงในปริมาตรสุดท้าย 100 mL ซึ่งเทไม่ลง และเทสต์เดิมยืนยันตัวเลขชุดนั้นว่าถูก
  // ที่ถูกคือต้องบอกว่าทำไม่ได้ แล้วชี้ทางที่ใช้ได้จริง ตามหลักการข้อ 4 ของโปรเจกต์
  it("โหมด working dilution: ค่าเริ่มต้นเป็นกรณีที่ไม่ต้องใช้เครื่องมือนี้ ต้องบอกตรง ๆ", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialMode="working-dilution" />);

    expect(html).toContain("อ่อนกว่าเป้าหมาย");
    expect(html).toContain("ไม่ต้องทำ working dilution");
    expect(html).toContain("16.666667");
    expect(html).not.toContain("166.666667");
  });

  it("โหมด working dilution: คำนวณสำเร็จเมื่อ working stock เข้มกว่าเป้าหมาย", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialMode="working-dilution"
        initialDoseInput={{ targetPercent: 0.3, finalVolumeMl: 100 }}
      />,
    );

    expect(html).toContain("working stock 0.6%");
    expect(html).toContain("ตวงต้นทาง 10 mL");
    expect(html).toContain("เติมน้ำ 90 mL");
    expect(html).toContain("50 mL");
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

describe("HaiterCalculator · หน่วยบนฉลาก", () => {
  // ไฮเตอร์ที่เจ้าของมีจริงระบุ 6% w/w ซึ่งไม่เท่ากับ 6% w/v
  // เดิมระบบไม่มีที่ให้ระบุ จึงคิดคลอรีนต่ำกว่าจริงราว 8 เปอร์เซ็นต์เสมอ
  it("ตั้งต้นเป็น w/v และยังไม่ขึ้นคำอธิบายการแปลงหน่วย", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("ฉลากบอกแบบไหน");
    expect(html).not.toContain("หลังคูณความหนาแน่น");
  });

  it("มีตัวเลือก w/w ให้ผู้ใช้ระบุได้", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("w/w");
  });
});
