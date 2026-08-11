"use client";

import type { FormEvent, Ref } from "react";
import { acceptedMediaTypes } from "./media-upload-logic";

type MediaUploaderViewProps = {
  actionLabel: string;
  purpose: string;
  requiredFrame: string[];
  fileName: string | null;
  previewUrl: string;
  caption: string;
  uploadDisabled: boolean;
  uploadReason: string;
  reasonId: string;
  status: string;
  error: string;
  fileInputRef: Ref<HTMLInputElement>;
  onFileSelected: (file: File | null) => void;
  onCaptionChanged: (caption: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function MediaUploaderView({
  actionLabel,
  purpose,
  requiredFrame,
  fileName,
  previewUrl,
  caption,
  uploadDisabled,
  uploadReason,
  reasonId,
  status,
  error,
  fileInputRef,
  onFileSelected,
  onCaptionChanged,
  onSubmit,
}: MediaUploaderViewProps) {
  return <form className="media-uploader" onSubmit={onSubmit}>
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
      <span>{actionLabel}</span>
      <input ref={fileInputRef} accept={acceptedMediaTypes} onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)} type="file" />
    </label>
    <div className="media-file-status" role="status" aria-live="polite">
      <strong>{fileName ? `เลือกแล้ว: ${fileName}` : "ยังไม่ได้เลือกภาพ"}</strong>
      <div className="media-preview">
        {previewUrl ? <>
          {/* preview เป็น object URL ในเครื่อง จึงใช้ next/image ไม่ได้ */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={`ตัวอย่าง ${fileName ?? "ภาพที่เลือก"}`} src={previewUrl} />
        </> : <span>ตัวอย่างภาพจะแสดงตรงนี้</span>}
      </div>
    </div>
    <label className="media-caption">คำอธิบายภาพ<input value={caption} onChange={(event) => onCaptionChanged(event.target.value)} placeholder="เช่น ฉลากด้านหลัง เห็นตัวเลข 6%" /></label>
    <button className="cl-button-primary media-submit" disabled={uploadDisabled} aria-describedby={uploadDisabled && uploadReason ? reasonId : undefined} type="submit">อัปโหลดรูปที่เลือก</button>
    {uploadDisabled && uploadReason ? <small id={reasonId} className="media-upload-reason">{uploadReason}</small> : null}
    {status && <small role="status">{status}</small>}
    {error && <small className="field-error" role="alert">{error}</small>}
  </form>;
}
