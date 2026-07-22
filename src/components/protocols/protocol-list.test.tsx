import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProtocolList } from "./protocol-list";

describe("ProtocolList", () => {
  it("links protocols and shows status", () => {
    const html = renderToStaticMarkup(<ProtocolList protocols={[{ id: "p1", ownerId: "o1", title: "Nodal", slug: "nodal", plantScope: "Philodendron", evidenceState: "Adapted", status: "Draft", currentVersionId: "v1", createdAt: "t", updatedAt: "t", deletedAt: null }]} />);
    expect(html).toContain('href="/protocols/p1"'); expect(html).toContain("Draft");
  });
});
