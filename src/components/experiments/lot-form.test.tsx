import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LotForm } from "./lot-form";

describe("LotForm", () => {
  it("renders accessible structured lot fields", () => {
    const html = renderToStaticMarkup(<LotForm onSubmit={async () => undefined} />);
    expect(html).toContain("Lot ID");
    expect(html).toContain("ชื่อพืช");
    expect(html).toContain("Protocol");
    expect(html).toContain("Stage");
    expect(html).toContain("วันที่เริ่ม");
  });

  it("offers published protocol snapshots instead of free text", () => {
    const html = renderToStaticMarkup(<LotForm onSubmit={async () => undefined} protocolOptions={[{ id: "p1", title: "Sterile start", versionId: "v1", version: "1.0.0" }]} />);
    expect(html).toContain('value="p1::v1"');
    expect(html).toContain("Sterile start · v1.0.0");
    expect(html).toContain('name="protocolVersion"');
  });
});
