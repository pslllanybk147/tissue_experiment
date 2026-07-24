import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeLibrary } from "./knowledge-library";
import { starterTaxa } from "../../lib/domain/knowledge-library";

describe("KnowledgeLibrary", () => {
  it("renders taxonomy search and pending evidence state", () => {
    const html = renderToStaticMarkup(<KnowledgeLibrary records={starterTaxa.map(taxon => ({ taxon, claims: [], playbooks: [] }))} />);
    expect(html).toContain("ค้น taxonomy");
    expect(html).toContain("Pink Princess");
    expect(html).toContain("Verified");
    expect(html).toContain("Adapted");
  });
});
