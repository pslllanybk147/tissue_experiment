import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeAuditViewer } from "./knowledge-audit-viewer";

describe("KnowledgeAuditViewer", () => {
  it("renders filters and expandable before/after details", () => {
    const html = renderToStaticMarkup(<KnowledgeAuditViewer sources={[{ id: "source-1", ownerId: "owner-1", title: "Paper", sourceType: "journal", url: "https://example.com", doi: null, authors: "", publishedAt: null, license: null, notes: "", createdAt: "2026-07-24", updatedAt: "2026-07-24" }]} records={[{ taxon: { id: "taxon-1", scientificName: "Philodendron", displayName: "Pink Princess", rank: "cultivar", parentId: null, synonyms: [], commonNames: [], confidence: "High", evidenceState: "Verified", sourceIds: [], createdAt: "", updatedAt: "" }, claims: [], playbooks: [] }]} events={[{ id: "audit-1", ownerId: "owner-1", sourceId: "source-1", action: "updated", occurredAt: "2026-07-24T01:00:00.000Z", before: { title: "Old" }, after: { title: "New" }, entityType: "source" }]} />);
    expect(html).toContain("กรอง audit");
    expect(html).toContain("แก้ไข metadata");
    expect(html).toContain("ดู before / after");
  });
});
