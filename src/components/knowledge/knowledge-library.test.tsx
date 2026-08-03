import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeLibrary } from "./knowledge-library";
import { starterKnowledgeRecords } from "../../lib/domain/knowledge-seed";

describe("KnowledgeLibrary", () => {
  it("แสดงรายชื่อ taxon ให้ค้นได้", () => {
    const records = starterKnowledgeRecords();
    const pink = records.find((record) => record.taxon.id === "cultivar-pink-princess");
    const html = renderToStaticMarkup(<KnowledgeLibrary records={pink ? [pink] : records} />);

    expect(html).toContain("ค้น taxonomy");
    expect(html).toContain("Pink Princess");
  });

  it("ไม่ seed claim มาให้เอง เพราะหลักฐานของคู่มืออยู่ที่ src/lib/manual แหล่งเดียว", () => {
    const records = starterKnowledgeRecords();

    expect(records.every((record) => record.claims.length === 0)).toBe(true);
    expect(records.every((record) => record.playbooks.length === 0)).toBe(true);
  });

  it("บอกตรง ๆ ว่ายังไม่มี claim แทนที่จะแสดงของที่ไม่ได้ผ่านการตรวจ", () => {
    const records = starterKnowledgeRecords();
    const pink = records.find((record) => record.taxon.id === "cultivar-pink-princess");
    const html = renderToStaticMarkup(<KnowledgeLibrary records={pink ? [pink] : records} />);

    expect(html).toContain("Claims ที่เกี่ยวข้อง (0)");
    expect(html).toContain("ยังไม่มี claim");
  });
});
