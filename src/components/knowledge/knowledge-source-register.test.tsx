import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { starterTaxa } from "../../lib/domain/knowledge-library";
import { KnowledgeSourceRegister } from "./knowledge-source-register";

describe("KnowledgeSourceRegister", () => {
  it("renders registered sources and claim draft language", () => {
    const html = renderToStaticMarkup(<KnowledgeSourceRegister records={starterTaxa.map(taxon => ({ taxon, claims: [], playbooks: [] }))} sources={[{ id: "source-1", ownerId: "owner", title: "Paper", sourceType: "journal", url: "https://example.com/paper", doi: "10.1000/example", authors: "Author", publishedAt: null, license: null, notes: "", createdAt: "", updatedAt: "" }]} claims={[]} onCreateSource={async () => undefined} onCreateClaim={async () => undefined} onReviewClaim={async () => undefined} onDiscover={async () => { throw new Error("not used"); }} />);
    expect(html).toContain("แหล่งอ้างอิงในระบบ (1)");
    expect(html).toContain("สร้าง claim draft จาก source");
  });
});
