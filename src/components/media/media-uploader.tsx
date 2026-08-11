"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { ObservationMedia } from "../../lib/domain/models";
import { getFirebaseServices } from "../../lib/firebase/client";
import {
  acceptedMediaTypes,
  createPreviewLifecycle,
  resetFileInput,
  uploadObservationMedia,
} from "./media-upload-logic";
import { MediaUploaderView } from "./media-uploader-view";

export { readApiError } from "./media-upload-logic";

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
  const [previewUrl, setPreviewUrl] = useState("");
  const reasonId = `${useId()}-media-upload-reason`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewLifecycle = useRef<ReturnType<typeof createPreviewLifecycle> | null>(null);
  if (previewLifecycle.current == null) previewLifecycle.current = createPreviewLifecycle(URL);

  useEffect(() => {
    const lifecycle = previewLifecycle.current;
    return () => lifecycle?.dispose();
  }, []);

  function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setPreviewUrl(previewLifecycle.current?.replace(nextFile) ?? "");
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("กรุณาเลือกภาพ");
    if (!acceptedMediaTypes.includes(file.type) || file.size > 10_000_000) return setError("รองรับ JPEG, PNG, WebP ไม่เกิน 10 MB");
    const user = getFirebaseServices()?.auth.currentUser;
    if (!user) return setError("กรุณาเข้าสู่ระบบ");
    setError("");
    try {
      await uploadObservationMedia({
        file,
        lotId,
        observationId,
        caption,
        user,
        fetcher: fetch,
        now: () => new Date().toISOString(),
        onUploaded,
        onStatus: setStatus,
      });
      resetFileInput(fileInputRef.current);
      selectFile(null);
      setCaption("");
      setStatus("อัปโหลดสำเร็จ");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "อัปโหลดไม่สำเร็จ");
    }
  }

  return <MediaUploaderView
    actionLabel={actionLabel}
    purpose={purpose}
    requiredFrame={requiredFrame}
    fileName={file?.name ?? null}
    previewUrl={previewUrl}
    caption={caption}
    uploadDisabled={!file}
    uploadReason={!file ? "เลือกภาพก่อน จึงจะอัปโหลดได้" : ""}
    reasonId={reasonId}
    status={status}
    error={error}
    fileInputRef={fileInputRef}
    onFileSelected={selectFile}
    onCaptionChanged={setCaption}
    onSubmit={(event) => void submit(event)}
  />;
}
