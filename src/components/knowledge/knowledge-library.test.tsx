import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeLibrary } from "./knowledge-library";
import { starterKnowledgeRecords } from "../../lib/domain/knowledge-seed";

describe("KnowledgeLibrary", () => {
  it("renders taxonomy search and pending evidence state", () => {
    const records = starterKnowledgeRecords();
    const pink = records.find((record) => record.taxon.id === "cultivar-pink-princess");
    const html = renderToStaticMarkup(<KnowledgeLibrary records={pink ? [pink] : records} />);
    expect(html).toContain("ค้น taxonomy");
    expect(html).toContain("Pink Princess");
    expect(html).toContain("Verified");
    expect(html).toContain("Adapted");
    expect(html).toContain("Claims ที่เกี่ยวข้อง (5)");
    expect(html).toContain("nodal · v0.1.0 · Active");
  });
});
