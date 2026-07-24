import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DatasetItem } from "@/lib/domain/models";
import { ReviewQueue } from "./review-queue";

const item: DatasetItem = {
  id: "dataset-1", ownerId: "owner-1", mediaId: "media-1", lotId: "LOT-1", observationId: "obs-1", assetUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  provenance: { kind: "user-captured", sourceUrl: null, license: null, attribution: null, provenanceId: "capture-1", status: "Pending review", reviewedBy: null, reviewedAt: null, note: "จาก observation" },
  label: null, reviewStatus: "Pending review", includedInTraining: false, createdAt: "2026-07-23T00:00:00.000Z", updatedAt: "2026-07-23T00:00:00.000Z",
};

describe("ReviewQueue", () => {
  it("shows pending provenance and blocks label submission until approval", () => {
    const html = renderToStaticMarkup(<ReviewQueue items={[item]} onReviewProvenance={async () => undefined} onSetLabel={async () => undefined} />);
    expect(html).toContain("Review Queue");
    expect(html).toContain("Pending review");
    expect(html).toContain("ต้อง Approve provenance ก่อน");
    expect(html).toContain("disabled");
  });
});
