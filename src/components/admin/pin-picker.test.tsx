import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PinPicker } from "./pin-picker";

describe("PinPicker", () => {
  it("เป็น main landmark เดียวและใช้โครงหน้า/ฟิลด์ร่วม", () => {
    const html = renderToStaticMarkup(<PinPicker forms={[]} />);

    expect(html.match(/<main/g)).toHaveLength(1);
    expect(html).toContain('class="cl-atlas-form-section cl-atlas-wide"');
    expect(html).toContain("cl-button-secondary");
    expect(html).not.toContain("system-ui");
  });
});
