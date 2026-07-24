import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { philodendronMonographs } from "../../lib/domain/philodendron-knowledge";
import { PhilodendronMonograph } from "./philodendron-monograph";

describe("Philodendron monograph", () => {
  it("renders the four knowledge sections and the guided tissue-culture steps", () => {
    const html = renderToStaticMarkup(<PhilodendronMonograph monograph={philodendronMonographs[0]} />);
    expect(html).toContain("Taxonomy");
    expect(html).toContain("Biology");
    expect(html).toContain("Identification");
    expect(html).toContain("Tissue culture");
    expect(html).toContain("ตัดและเตรียม explant");
    expect(html).toContain("ฟอกฆ่าเชื้อผิว explant");
    expect(html).toContain("MS + BAP 1.0 mg/L");
  });
});
