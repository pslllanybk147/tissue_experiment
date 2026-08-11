"use client";

import { MediaUploader } from "@/components/media/media-uploader";
import type { ObservationMedia } from "@/lib/domain/models";

export function StepPhotos({
  lotId,
  observationId,
  media,
  canAttach,
  reason,
  onUploaded,
}: {
  lotId: string;
  observationId: string | null;
  media: ObservationMedia[];
  canAttach: boolean;
  reason: string;
  onUploaded: (item: ObservationMedia) => Promise<void>;
}) {
  const visible = media.filter((item) => !item.deletedAt);

  return (
    <section className="cl-photo-evidence">
      <h2>หลักฐานภาพของขั้นนี้</h2>

      {visible.length === 0 ? (
        <p className="cl-photo-empty">ยังไม่มีรูปของขั้นนี้</p>
      ) : (
        <ul className="cl-photo-list">
          {visible.map((item) => (
            <li key={item.id}>
              <a className="pl-link" href={item.secureUrl} rel="noreferrer" target="_blank">
                {/* ใช้ img ธรรมดาเพราะโดเมนของ Cloudinary เปลี่ยนตามการตั้งค่าของผู้ใช้แต่ละคน */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.caption || "รูปหลักฐานของขั้นนี้"}
                  src={item.secureUrl}
                  width={160}
                  height={120}
                  className="cl-photo-thumbnail"
                />
              </a>
              {item.caption ? (
                <p className="cl-photo-caption">{item.caption}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canAttach && observationId ? (
        <div className="cl-photo-uploader">
          <MediaUploader
            actionLabel="เลือกหรือถ่ายรูปของขั้นนี้"
            lotId={lotId}
            observationId={observationId}
            onUploaded={onUploaded}
            purpose="ใช้ยืนยันว่าคุณทำขั้นนี้กับของจริง"
          />
        </div>
      ) : (
        <p className="cl-photo-unavailable">{reason}</p>
      )}
    </section>
  );
}
