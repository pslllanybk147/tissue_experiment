"use client";

import { useState, type FormEvent } from "react";

import type { ObservationMedia } from "../../lib/domain/models";
import { getFirebaseServices } from "../../lib/firebase/client";

const accepted = "image/jpeg,image/png,image/webp";

export async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { error?: string | { message?: string } };
    if (typeof body.error === "string") return body.error;
    if (body.error?.message) return body.error.message;
    return `${fallback} (HTTP ${response.status})`;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

type MediaUploaderProps = {
  lotId: string;
  observationId: string;
  onUploaded: (media: ObservationMedia) => Promise<void>;
  actionLabel?: string;
  purpose?: string;
  requiredFrame?: string[];
};

export function MediaUploader({
  lotId,
  observationId,
  onUploaded,
  actionLabel = "เลือกหรือถ่ายรูป",
  purpose = "ใช้เป็นหลักฐานของสิ่งที่เห็นในขั้นนี้",
  requiredFrame = [],
}: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("กรุณาเลือกภาพ");
    if (!accepted.includes(file.type) || file.size > 10_000_000) return setError("รองรับ JPEG, PNG, WebP ไม่เกิน 10 MB");
    const user = getFirebaseServices()?.auth.currentUser;
    if (!user) return setError("กรุณาเข้าสู่ระบบ");
    setError("");
    setStatus("กำลังขอลายเซ็น…");
    try {
      const token = await user.getIdToken(true);
      const signedResponse = await fetch("/api/media/sign", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ lotId, observationId, mimeType: file.type, bytes: file.size }) });
      if (!signedResponse.ok) throw new Error(await readApiError(signedResponse, "ขอลายเซ็นอัปโหลดไม่สำเร็จ"));
      const signed = await signedResponse.json();
      setStatus("กำลังอัปโหลด…");
      const form = new FormData();
      form.set("file", file);
      form.set("api_key", signed.apiKey);
      form.set("timestamp", String(signed.timestamp));
      form.set("signature", signed.signature);
      form.set("folder", signed.folder);
      form.set("public_id", signed.publicId);
      const upload = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: "POST", body: form });
      if (!upload.ok) throw new Error(await readApiError(upload, "อัปโหลดภาพไม่สำเร็จ"));
      const result = await upload.json();
      const now = new Date().toISOString();
      await onUploaded({ id: signed.publicId, ownerId: user.uid, lotId, observationId, cloudinaryPublicId: result.public_id, secureUrl: result.secure_url, width: result.width, height: result.height, format: result.format, bytes: result.bytes, caption, capturedAt: null, createdBy: user.uid, createdAt: now, updatedAt: now, deletedAt: null });
      setFile(null);
      setCaption("");
      setStatus("อัปโหลดสำเร็จ");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "อัปโหลดไม่สำเร็จ");
    }
  }

  return <form className="media-uploader" onSubmit={submit}>
    <div className="media-purpose">
      <strong>{actionLabel}</strong>
      <p>{purpose}</p>
      {requiredFrame.length > 0 && (
        <>
          <span>ในรูปต้องเห็น:</span>
          <ul>{requiredFrame.map((item) => <li key={item}>{item}</li>)}</ul>
        </>
      )}
    </div>
    <label className="photo-action">
      <span>{file ? `เลือกแล้ว: ${file.name}` : actionLabel}</span>
      <input accept={accepted} onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
    </label>
    <label>คำอธิบายภาพ<input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="เช่น ฉลากด้านหลัง เห็นตัวเลข 6%" /></label>
    <button className="primary-button media-submit" disabled={!file} type="submit">อัปโหลดรูปที่เลือก</button>
    {status && <small role="status">{status}</small>}
    {error && <small className="field-error" role="alert">{error}</small>}
  </form>;
}
