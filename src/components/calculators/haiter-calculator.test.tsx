import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HaiterCalculator } from "./haiter-calculator";

describe("HaiterCalculator", () => {
  it("ฟอร์มเดียว ไม่มีแท็บและไม่มีช่องกรอกอัตราเจือจาง", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).not.toContain("คำนวณตรง");
    expect(html).not.toContain("Working dilution");
    expect(html).not.toContain("เจือจางกี่เท่า");
    expect(html).not.toContain("ปริมาตร working ที่จะเตรียม");
    expect(html).toContain("cl-field-group");
    expect(html).toContain("aria-live");
  });

  it("ค่าเริ่มต้นตวงตรงได้ แสดงตัวเลข mL เดียวไม่มีขั้นตอนเจือจาง", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("16.666667 mL");
    expect(html).not.toContain("ขั้น 1");
  });

  it("ตัวเลขจากภาพหน้าจอจริงของผู้ใช้ (6% w/w = 6.48% w/v, เป้าหมาย 1%, 100mL, ตวงละเอียดสุด 0.1mL) ต้องได้ตวงตรง", () => {
    // labelBasis เป็น state ภายในเสมอ ไม่มี prop ให้ตั้งต้นเป็น w/w ได้ตรง ๆ (เหมือนพฤติกรรมเดิม)
    // จึงส่ง sourcePercent เป็นค่าที่แปลงเป็น w/v แล้ว (6% w/w x ความหนาแน่น 1.08 = 6.48% w/v)
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ sourcePercent: 6.48, targetPercent: 1, finalVolumeMl: 100, minimumMeasurableMl: 0.1 }}
      />,
    );

    expect(html).toContain("15.432099");
  });

  it("ต้องเจือจางจริง แสดง 2 ขั้นตอนพร้อมตัวเลขที่ระบบเลือกให้เอง", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ targetPercent: 0.05, finalVolumeMl: 10, minimumMeasurableMl: 0.5 }}
      />,
    );

    expect(html).toContain("ขั้น 1");
    expect(html).toContain("ตวงไฮเตอร์ 3.333333 mL");
    expect(html).toContain("น้ำ 16.666667 mL");
    expect(html).toContain("รวมเป็น 20 mL");
    expect(html).toContain("ขั้น 2");
    expect(html).toContain("ตวง 0.5 mL");
    expect(html).toContain("ผสมน้ำให้ครบ 10 mL");
    expect(html).toContain("เจือจาง 1:6");
  });

  it("โชว์การ์ดเตือนเมื่อ target มากกว่าหรือเท่ากับ source", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator initialInput={{ sourcePercent: 1, targetPercent: 2 }} />,
    );

    expect(html).toContain("target concentration ต้องต่ำกว่า source concentration");
  });

  it("โชว์การ์ดเตือนเมื่อไม่มีอัตราเจือจางไหนตวงได้จริงด้วยเครื่องมือนี้", () => {
    const html = renderToStaticMarkup(
      <HaiterCalculator
        initialInput={{ targetPercent: 0.003, finalVolumeMl: 1, minimumMeasurableMl: 50 }}
      />,
    );

    expect(html).toContain("อุปกรณ์ตวงละเอียดไม่พอ");
  });
});

describe("HaiterCalculator · หน่วยบนฉลาก", () => {
  // ไฮเตอร์ที่เจ้าของมีจริงระบุ 6% w/w ซึ่งไม่เท่ากับ 6% w/v
  it("ตั้งต้นเป็น w/v และยังไม่ขึ้นคำอธิบายการแปลงหน่วย", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("ฉลากเขียนกำกับว่า");
    expect(html).not.toContain("หลังคูณความหนาแน่น");
  });

  it("มีตัวเลือก w/w ให้ผู้ใช้ระบุได้", () => {
    const html = renderToStaticMarkup(<HaiterCalculator />);

    expect(html).toContain("w/w");
  });

  it("รับหน่วยเริ่มต้นจากโปรไฟล์ผู้ใช้ได้ เพื่อไม่ให้ 6% w/w ถูกคำนวณเหมือน 6% w/v", () => {
    const html = renderToStaticMarkup(<HaiterCalculator initialLabelBasis="w/w" />);

    expect(html).toContain("หลังคูณความหนาแน่น");
  });
});
