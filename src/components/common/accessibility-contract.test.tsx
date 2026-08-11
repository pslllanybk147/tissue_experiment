import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccessibleAction } from "./accessible-action";

describe("senior-friendly accessibility contract", () => {
  it("marks primary and photo actions with shared task hierarchy classes", () => {
    const primary = renderToStaticMarkup(
      <AccessibleAction intent="primary">เริ่มทำขั้นตอน</AccessibleAction>,
    );
    const photo = renderToStaticMarkup(
      <AccessibleAction intent="photo">เลือกหรือถ่ายรูป</AccessibleAction>,
    );

    expect(primary).toContain("cl-button-primary");
    expect(photo).toContain("cl-button-secondary");
  });
});
