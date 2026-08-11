import { renderToStaticMarkup } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { MediaUploader } from "./media-uploader";
import { MediaUploaderView } from "./media-uploader-view";
import {
  createPreviewLifecycle,
  readApiError,
  resetFileInput,
  uploadObservationMedia,
} from "./media-upload-logic";

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

  it("ก่อนเลือกไฟล์ ปิดปุ่มอัปโหลดและบอกเหตุผลที่อ่านเข้าใจได้", () => {
    const html = renderToStaticMarkup(
      <MediaUploader lotId="LOT-1" observationId="OBS-1" onUploaded={async () => undefined} />,
    );
    const submitAt = html.indexOf("อัปโหลดรูปที่เลือก");
    const button = html.slice(html.lastIndexOf("<button", submitAt), submitAt);

    expect(button).toContain("disabled");
    expect(button).toContain('class="cl-button-primary media-submit"');
    expect(html).toContain("เลือกภาพก่อน จึงจะอัปโหลดได้");
    expect(html).toMatch(/aria-describedby="[^"]*media-upload-reason[^"]*"/);
  });

  it("แสดงช่องสถานะชื่อไฟล์แยกจากข้อความบนพื้นที่เลือกภาพ", () => {
    const html = renderToStaticMarkup(
      <MediaUploader lotId="LOT-1" observationId="OBS-1" onUploaded={async () => undefined} />,
    );

    expect(html).toContain('class="media-file-status"');
    expect(html).toContain('class="media-preview"');
    expect(html).toContain("ยังไม่ได้เลือกภาพ");
    expect(html.indexOf('class="photo-action"')).toBeLessThan(html.indexOf('class="media-file-status"'));
  });

  it("presentational view เปิดปุ่มและแสดงชื่อกับ preview เมื่อมีไฟล์แล้ว", () => {
    const html = renderToStaticMarkup(
      <MediaUploaderView
        actionLabel="เลือกภาพ"
        purpose="ใช้ยืนยันผล"
        requiredFrame={[]}
        fileName="ชิ้นพืชหลังล้าง.webp"
        previewUrl="blob:preview-1"
        caption=""
        uploadDisabled={false}
        uploadReason=""
        reasonId="selected-media-upload-reason"
        status="พร้อมอัปโหลด"
        error=""
        onFileSelected={() => undefined}
        onCaptionChanged={() => undefined}
        onSubmit={() => undefined}
        fileInputRef={null}
      />,
    );
    const submitAt = html.indexOf("อัปโหลดรูปที่เลือก");
    const button = html.slice(html.lastIndexOf("<button", submitAt), submitAt);

    expect(html).toContain("เลือกแล้ว: ชิ้นพืชหลังล้าง.webp");
    expect(html).toContain('src="blob:preview-1"');
    expect(html).toContain("พร้อมอัปโหลด");
    expect(button).not.toContain("disabled");
    expect(button).not.toContain("aria-describedby");
  });

  it("useId ทำให้ uploader สองตัวไม่มี id เหตุผลซ้ำกัน", () => {
    const html = renderToStaticMarkup(<>
      <MediaUploader lotId="LOT-1" observationId="OBS-1" onUploaded={async () => undefined} />
      <MediaUploader lotId="LOT-2" observationId="OBS-2" onUploaded={async () => undefined} />
    </>);
    const ids = [...html.matchAll(/id="([^"]*media-upload-reason[^"]*)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(html).toContain(`aria-describedby="${id}"`);
  });

  it("preview lifecycle revoke URL เดิมเมื่อแทนที่ และ revoke URL ล่าสุดครั้งเดียวเมื่อ dispose", () => {
    const events: string[] = [];
    const lifecycle = createPreviewLifecycle({
      createObjectURL: (file) => {
        const url = `blob:${file.name}`;
        events.push(`create:${url}`);
        return url;
      },
      revokeObjectURL: (url) => events.push(`revoke:${url}`),
    });

    expect(lifecycle.replace(new File(["a"], "a.jpg", { type: "image/jpeg" }))).toBe("blob:a.jpg");
    expect(lifecycle.replace(new File(["b"], "b.jpg", { type: "image/jpeg" }))).toBe("blob:b.jpg");
    lifecycle.dispose();
    lifecycle.dispose();

    expect(events).toEqual([
      "create:blob:a.jpg",
      "create:blob:b.jpg",
      "revoke:blob:a.jpg",
      "revoke:blob:b.jpg",
    ]);
  });

  it("resetFileInput ล้าง native value เพื่อให้เลือกไฟล์เดิมซ้ำได้", () => {
    const input = { value: "C:\\fakepath\\leaf.jpg" } as HTMLInputElement;

    resetFileInput(input);

    expect(input.value).toBe("");
  });

  it("MediaUploader ต่อ ref ของ input จริงเข้ากับ reset หลังอัปโหลดสำเร็จ", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/components/media/media-uploader.tsx"), "utf8");

    expect(source).toContain("fileInputRef={fileInputRef}");
    expect(source).toContain("resetFileInput(fileInputRef.current)");
  });

  it("upload transaction ทำ sign แล้ว upload ก่อนส่ง payload ให้ callback", async () => {
    const events: string[] = [];
    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      events.push(url === "/api/media/sign" ? "sign" : "upload");
      if (url === "/api/media/sign") {
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({
          lotId: "LOT-1",
          observationId: "OBS-1",
          mimeType: "image/webp",
          bytes: 5,
        });
        return Response.json({
          apiKey: "key",
          timestamp: 123,
          signature: "signature",
          folder: "folder",
          publicId: "media-1",
          cloudName: "demo",
        });
      }
      expect(url).toBe("https://api.cloudinary.com/v1_1/demo/image/upload");
      expect(init?.method).toBe("POST");
      const form = init?.body as FormData;
      expect(form.get("file")).toBeInstanceOf(File);
      expect(form.get("api_key")).toBe("key");
      expect(form.get("timestamp")).toBe("123");
      expect(form.get("signature")).toBe("signature");
      expect(form.get("folder")).toBe("folder");
      expect(form.get("public_id")).toBe("media-1");
      return Response.json({
        public_id: "folder/media-1",
        secure_url: "https://example.com/media-1.webp",
        width: 800,
        height: 600,
        format: "webp",
        bytes: 321,
      });
    };
    let uploadedId = "";

    await uploadObservationMedia({
      file: new File(["photo"], "leaf.webp", { type: "image/webp" }),
      lotId: "LOT-1",
      observationId: "OBS-1",
      caption: "ใบหลังล้าง",
      user: { uid: "owner-1", getIdToken: async () => "token-1" },
      fetcher,
      now: () => "2026-08-11T00:00:00.000Z",
      onUploaded: async (media) => {
        events.push("callback");
        uploadedId = media.id;
        expect(media).toMatchObject({
          id: "media-1",
          ownerId: "owner-1",
          lotId: "LOT-1",
          observationId: "OBS-1",
          caption: "ใบหลังล้าง",
          secureUrl: "https://example.com/media-1.webp",
        });
      },
    });

    expect(events).toEqual(["sign", "upload", "callback"]);
    expect(uploadedId).toBe("media-1");
  });

  it("upload transaction ส่ง error จาก sign ต่อให้ caller แสดงผล", async () => {
    await expect(uploadObservationMedia({
      file: new File(["photo"], "leaf.jpg", { type: "image/jpeg" }),
      lotId: "LOT-1",
      observationId: "OBS-1",
      caption: "",
      user: { uid: "owner-1", getIdToken: async () => "token-1" },
      fetcher: async () => new Response(JSON.stringify({ error: "sign rejected" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
      now: () => "2026-08-11T00:00:00.000Z",
      onUploaded: async () => undefined,
    })).rejects.toThrow("sign rejected");
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
