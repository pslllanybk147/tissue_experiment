import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlantPicker } from "./plant-picker";

const plants = [
  {
    slug: "pink-princess",
    scientificName: "Philodendron erubescens ‘Pink Princess’",
    commonName: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส",
    summary: "ขยายจากตาข้าง",
    stepCount: 14,
    durationLabel: "4 ถึง 8 เดือน",
  },
];

describe("PlantPicker", () => {
  it("ถามคำถามเดียวว่าจะเพาะต้นอะไร", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain("จะเพาะต้นอะไรดี");
    expect(html).toContain("ยังไม่ต้องสมัคร");
  });

  it("ลิงก์ไปหน้าคู่มือของแต่ละต้นและบอกจำนวนขั้น", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain('href="/guide/pink-princess"');
    expect(html).toContain("14 ขั้น");
    expect(html).toContain("4 ถึง 8 เดือน");
  });

  it("แสดงทั้งชื่อวิทยาศาสตร์และชื่อที่คนเรียกกัน", () => {
    const html = renderToStaticMarkup(<PlantPicker plants={plants} />);

    expect(html).toContain("Pink Princess");
    expect(html).toContain("ฟิโลเดนดรอน พิงค์ปริ๊นเซส");
  });
});
