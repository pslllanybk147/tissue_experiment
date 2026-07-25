import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccessibleAction } from "./accessible-action";

describe("AccessibleAction", () => {
  it("keeps text inside the control and exposes intent without color alone", () => {
    const html = renderToStaticMarkup(
      <AccessibleAction intent="primary">บันทึกผลของขั้นนี้</AccessibleAction>,
    );

    expect(html).toContain("บันทึกผลของขั้นนี้");
    expect(html).toContain('data-intent="primary"');
    expect(html).toContain("accessible-action");
  });
});
