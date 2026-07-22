import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProtocolHistory } from "./protocol-history";

describe("ProtocolHistory", () => {
  it("marks published versions immutable", () => {
    const html = renderToStaticMarkup(<ProtocolHistory versions={[{ id: "v1", protocolId: "p1", ownerId: "o1", version: "0.1.0", summary: "First", changeNote: "Initial", steps: [], createdBy: "o1", createdAt: "t", publishedAt: "t" }]} />);
    expect(html).toContain("0.1.0"); expect(html).toContain("เผยแพร่แล้ว");
  });
});
