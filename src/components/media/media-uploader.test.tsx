import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MediaUploader, readApiError } from "./media-uploader";

describe("MediaUploader", () => {
  it("renders accepted formats and caption", () => {
    const html = renderToStaticMarkup(
      <MediaUploader
        lotId="l1"
        observationId="x1"
        onUploaded={async () => undefined}
      />,
    );
    expect(html).toContain("image/jpeg,image/png,image/webp");
    expect(html).toContain("คำอธิบายภาพ");
  });

  it("explains why the photo is needed and what must appear in frame", () => {
    const html = renderToStaticMarkup(
      <MediaUploader
        actionLabel="เลือกหรือถ่ายรูปฉลากไฮเตอร์"
        lotId="LOT-1"
        observationId="OBS-1"
        onUploaded={async () => undefined}
        purpose="ใช้ยืนยันตัวเลขเปอร์เซ็นต์ก่อนให้ระบบคำนวณ"
        requiredFrame={["ชื่อผลิตภัณฑ์", "ตัวเลขเปอร์เซ็นต์", "ข้อความ active chlorine"]}
      />,
    );

    expect(html).toContain("เลือกหรือถ่ายรูปฉลากไฮเตอร์");
    expect(html).toContain("ใช้ยืนยันตัวเลขเปอร์เซ็นต์");
    expect(html).toContain("ชื่อผลิตภัณฑ์");
    expect(html).toContain("ข้อความ active chlorine");
  });

  it("surfaces safe API errors for deployment diagnosis", async () => {
    const response = new Response(JSON.stringify({ error: "Invalid authentication" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
    await expect(readApiError(response, "fallback")).resolves.toBe("Invalid authentication");
  });

  it("includes HTTP status when an upstream response is not JSON", async () => {
    const response = new Response("gateway error", { status: 502 });
    await expect(readApiError(response, "upload failed")).resolves.toBe(
      "upload failed (HTTP 502)",
    );
  });
});
