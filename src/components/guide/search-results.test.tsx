import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SearchResults } from "./search-results";

describe("ผลการค้นหา", () => {
  it("ยังไม่ได้พิมพ์อะไร แนะนำตัวอย่างคำค้น", () => {
    const html = renderToStaticMarkup(<SearchResults query="" />);
    expect(html).toContain("ลองพิมพ์");
  });

  it("เจอชนิด แสดงลิงก์ไปคู่มือของชนิดนั้น", () => {
    const html = renderToStaticMarkup(<SearchResults query="พิงค์" />);
    expect(html).toContain('href="/guide/pink-princess"');
  });

  it("ค้นไม่เจอ ต้องไม่ใช่ทางตัน และต้องเสนอประตูอื่น", () => {
    const html = renderToStaticMarkup(<SearchResults query="ปลาทอง" />);
    expect(html).toContain("ยังไม่มีคู่มือของต้นนี้");
    expect(html).toContain('href="/find"');
  });

  it("ค้นไม่เจอ ต้องไม่แกล้งทำเป็นว่ามีคำตอบ", () => {
    const html = renderToStaticMarkup(<SearchResults query="ปลาทอง" />);
    expect(html).not.toContain('href="/guide/');
  });

  it("มีช่องค้นหาที่ส่งด้วย GET เพื่อให้ทำงานได้โดยไม่ต้องมี JavaScript", () => {
    const html = renderToStaticMarkup(<SearchResults query="" />);
    expect(html).toContain('method="get"');
    expect(html).toContain('action="/search"');
    expect(html).toContain('name="q"');
  });

  it("ผลระดับสกุลบอกว่ายังไม่มีคู่มือเฉพาะ ไม่ปล่อยให้เข้าใจผิด", () => {
    const html = renderToStaticMarkup(<SearchResults query="ฟิโลเดนดรอน" />);
    expect(html).toContain("ยังไม่มีคู่มือเฉพาะ");
  });
});
