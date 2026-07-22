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
});
