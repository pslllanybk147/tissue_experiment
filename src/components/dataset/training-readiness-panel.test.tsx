import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TrainingReadinessReport } from "../../lib/domain/training-readiness";
import { TrainingReadinessPanel } from "./training-readiness-panel";

const report: TrainingReadinessReport = {
  schemaVersion: "training-readiness-v2",
  generatedAt: "2026-07-25T00:00:00.000Z",
  sourceJobId: "job-1",
  itemCount: 3,
  splitCounts: { train: 3, validation: 0, test: 0 },
  classCounts: { "Philodendron erubescens · Pink Princess": 3 },
  classSplitCounts: {
    "Philodendron erubescens · Pink Princess": {
      total: 3,
      train: 3,
      validation: 0,
      test: 0,
      distinctLots: 1,
    },
  },
  policy: {
    minimumClasses: 2,
    minimumTrainPerClass: 20,
    minimumValidationPerClass: 5,
    minimumTestPerClass: 5,
    minimumDistinctLotsPerClass: 3,
  },
  blockers: ["ต้องมีอย่างน้อย 2 คลาส แต่ขณะนี้มี 1 คลาส"],
  warnings: ["ต้องมีอย่างน้อย 2 คลาส แต่ขณะนี้มี 1 คลาส"],
  ready: false,
};

describe("TrainingReadinessPanel", () => {
  it("shows class-level deficits in the UI instead of only downloading JSON", () => {
    const html = renderToStaticMarkup(<TrainingReadinessPanel report={report} />);

    expect(html).toContain("ยังไม่พร้อมฝึกโมเดล");
    expect(html).toContain("Pink Princess");
    expect(html).toContain("ต้องมีอย่างน้อย 2 คลาส");
    expect(html).toContain("<td>3</td><td>0</td><td>0</td><td>1</td>");
    expect(html).toContain("cl-atlas-table-wrap");
    expect(html.match(/<th scope="col"/g)).toHaveLength(5);
  });
});
