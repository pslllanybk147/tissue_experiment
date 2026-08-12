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

  it("แสดงปุ่มลบรอบเมื่อหน้าหลักส่ง handler มาให้", () => {
    const html = renderToStaticMarkup(<RoundList rounds={rounds} onDelete={async () => {}} />);

    expect(html).toContain("ลบรอบนี้");
    expect(html).toContain('aria-label="ลบรอบ ฟิโลเดนดรอน พิงค์ปริ๊นเซส รหัส 1"');
    expect(html).toContain("cl-data-row");
    expect(html).toContain("เปิดรอบ");
    expect(html).toContain("cl-button-danger");
    expect(html).toContain("cl-atlas-data-list");
  });

  it("รอบเก่าที่คู่มือใหม่ไม่รู้จัก ต้องยังเห็นได้ ไม่ใช่หายไปเฉย ๆ", () => {
    const html = renderToStaticMarkup(
      <RoundList rounds={[]} legacy={[{ lotId: "old-1", title: "ล็อตเดิม", startedAt: "2026-07-01" }]} />,
    );

    expect(html).toContain("รอบที่เริ่มไว้ก่อนระบบคู่มือใหม่");
    expect(html).toContain("ล็อตเดิม");
    expect(html).toContain('href="/my/rounds/legacy/old-1"');
    expect(html).toContain("cl-atlas-data-list");
  });

  it("เมื่อยังไม่มีรอบ ชวนให้ไปเลือกต้นจากหน้าคู่มือ", () => {
    const html = renderToStaticMarkup(<RoundList rounds={[]} />);

    expect(html).toContain("ยังไม่มีรอบเพาะ");
    expect(html).toContain('href="/"');
  });
});
