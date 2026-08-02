import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RoundList } from "./round-list";

const rounds = [
  { lotId: "round-1", slug: "pink-princess", title: "ฟิโลเดนดรอน พิงค์ปริ๊นเซส", startedAt: "2026-08-01", passedCount: 6, stepCount: 14 },
];

describe("RoundList", () => {
  it("แสดงชื่อต้น วันที่เริ่ม และความคืบหน้า", () => {
    const html = renderToStaticMarkup(<RoundList rounds={rounds} />);

    expect(html).toContain("ฟิโลเดนดรอน พิงค์ปริ๊นเซส");
    expect(html).toContain("2026-08-01");
    expect(html).toContain("ผ่านแล้ว 6 จาก 14 ขั้น");
  });

  it("ลิงก์ไปหน้ารอบนั้น", () => {
    const html = renderToStaticMarkup(<RoundList rounds={rounds} />);

    expect(html).toContain('href="/my/rounds/round-1"');
  });

  it("เมื่อยังไม่มีรอบ ชวนให้ไปเลือกต้นจากหน้าคู่มือ", () => {
    const html = renderToStaticMarkup(<RoundList rounds={[]} />);

    expect(html).toContain("ยังไม่มีรอบเพาะ");
    expect(html).toContain('href="/"');
  });
});
