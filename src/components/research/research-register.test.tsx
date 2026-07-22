import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResearchRegister } from "./research-register";

describe("ResearchRegister", () => {
  it("renders evidence labels and source notes", () => {
    const html = renderToStaticMarkup(<ResearchRegister sources={[{
      id: "source-1", ownerId: "owner-1", title: "Pink Princess study",
      source: "Journal · 2023", evidence: "Verified", note: "Direct evidence",
    }]} />);
    expect(html).toContain("Pink Princess study");
    expect(html).toContain("Verified");
    expect(html).toContain("Direct evidence");
  });
});
