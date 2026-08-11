import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccessibleAction } from "./accessible-action";

describe("AccessibleAction", () => {
  it("maps the public intent to the shared Botanical Atlas button class", () => {
    const html = renderToStaticMarkup(
      <AccessibleAction intent="primary">บันทึกผลของขั้นนี้</AccessibleAction>,
    );

    expect(html).toContain("บันทึกผลของขั้นนี้");
    expect(html).toContain('data-intent="primary"');
    expect(html).toContain("cl-button-primary");
    expect(html).not.toContain("accessible-action-primary");
  });

  it("keeps photo actions on the secondary task hierarchy", () => {
    const html = renderToStaticMarkup(
      <AccessibleAction intent="photo">เลือกหรือถ่ายรูป</AccessibleAction>,
    );

    expect(html).toContain("cl-button-secondary");
    expect(html).toContain('data-intent="photo"');
  });
});
