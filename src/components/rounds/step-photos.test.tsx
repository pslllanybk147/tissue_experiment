import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ObservationMedia } from "@/lib/domain/models";
import { StepPhotos } from "./step-photos";

const media: ObservationMedia[] = [
  {
    id: "media-1",
    ownerId: "owner-1",
    lotId: "round-1",
    observationId: "obs-1",
    cloudinaryPublicId: "rounds/round-1/obs-1/media-1",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/media-1.jpg",
    width: 800,
    height: 600,
    format: "jpg",
    bytes: 12345,
    caption: "ชิ้นพืชหลังล้างรอบสุดท้าย",
    capturedAt: null,
    createdBy: "owner-1",
    createdAt: "2026-08-03T00:00:00.000Z",
    updatedAt: "2026-08-03T00:00:00.000Z",
    deletedAt: null,
  },
];

const noop = async () => {};

describe("StepPhotos", () => {
  it("แสดงรูปที่แนบไว้แล้วเป็นลิงก์เปิดดูภาพเต็ม พร้อมคำบรรยายเป็น alt", () => {
    const html = renderToStaticMarkup(
      <StepPhotos lotId="round-1" observationId="obs-1" media={media} canAttach reason="" onUploaded={noop} />,
    );

    expect(html).toContain("https://res.cloudinary.com/demo/image/upload/v1/media-1.jpg");
    expect(html).toContain("ชิ้นพืชหลังล้างรอบสุดท้าย");
  });

  it("เมื่อยังไม่มีรูป บอกตรง ๆ ว่ายังไม่มี", () => {
    const html = renderToStaticMarkup(
      <StepPhotos lotId="round-1" observationId="obs-1" media={[]} canAttach reason="" onUploaded={noop} />,
    );

    expect(html).toContain("ยังไม่มีรูปของขั้นนี้");
  });

  it("เมื่อแนบไม่ได้ ต้องบอกเหตุผล ไม่ใช่หายไปเฉย ๆ", () => {
    const html = renderToStaticMarkup(
      <StepPhotos
        lotId="round-1"
        observationId={null}
        media={[]}
        canAttach={false}
        reason="โหมดสาธิตยังแนบรูปไม่ได้ ต้องเข้าสู่ระบบด้วยบัญชีจริงก่อน"
        onUploaded={noop}
      />,
    );

    expect(html).toContain("โหมดสาธิตยังแนบรูปไม่ได้");
    expect(html).not.toContain('type="file"');
  });

  it("หัวข้อบอกชัดว่าเป็นหลักฐานภาพของขั้นนี้", () => {
    const html = renderToStaticMarkup(
      <StepPhotos lotId="round-1" observationId="obs-1" media={media} canAttach reason="" onUploaded={noop} />,
    );

    expect(html).toContain("หลักฐานภาพของขั้นนี้");
  });
});
