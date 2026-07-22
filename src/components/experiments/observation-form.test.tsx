import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ObservationForm } from "./observation-form";

describe("ObservationForm", () => {
  it("renders structured observation fields", () => {
    const html = renderToStaticMarkup(<ObservationForm defaultStage="Establishment" onSubmit={async () => undefined} />);
    for (const label of ["วันที่สังเกต", "สถานะ", "Stage", "บันทึก", "จำนวนยอด", "จำนวนราก", "จุดปนเปื้อน"]) expect(html).toContain(label);
  });
});
