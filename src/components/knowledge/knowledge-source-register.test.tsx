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

  it("shows playbook draft action only for an Approved claim", () => {
    const source = { id: "source-1", ownerId: "owner", title: "Paper", sourceType: "journal" as const, url: "https://example.com/paper", doi: null, authors: "Author", publishedAt: null, license: null, notes: "", createdAt: "", updatedAt: "" };
    const base = { id: "claim-1", ownerId: "owner", sourceId: source.id, taxonId: "cultivar-pink-princess", category: "tissue-culture" as const, statement: "Approved claim", evidenceExcerpt: "Excerpt", evidenceLocation: "p. 4", evidenceState: "Verified" as const, reviewerNote: "", reviewedBy: "owner", reviewedAt: "", createdAt: "", updatedAt: "" };
    const html = renderToStaticMarkup(<KnowledgeSourceRegister records={starterTaxa.map(taxon => ({ taxon, claims: [], playbooks: [] }))} sources={[source]} claims={[{ ...base, id: "approved", reviewState: "Approved" }, { ...base, id: "pending", reviewState: "Pending review" }]} onCreateSource={async () => undefined} onCreateClaim={async () => undefined} onReviewClaim={async () => undefined} onCreatePlaybookFromClaim={async () => undefined} onDiscover={async () => { throw new Error("not used"); }} />);
    expect(html.match(/สร้าง playbook draft/g)?.length).toBe(1);
  });
});
