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
    <section style={{ marginTop: "26px" }}>
      <h2 className="pl-h2">หลักฐานภาพของขั้นนี้</h2>

      {visible.length === 0 ? (
        <p className="pl-lede" style={{ marginTop: "8px" }}>ยังไม่มีรูปของขั้นนี้</p>
      ) : (
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "12px" }}>
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
                  style={{
                    display: "block",
                    width: "160px",
                    height: "120px",
                    objectFit: "cover",
                    border: "2.5px solid var(--pl-line)",
                    borderRadius: "12px",
                    boxShadow: "4px 4px 0 var(--pl-shadow)",
                  }}
                />
              </a>
              {item.caption ? (
                <p className="pl-meta" style={{ marginTop: "6px", maxWidth: "160px" }}>{item.caption}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canAttach && observationId ? (
        <div className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>
          <MediaUploader
            actionLabel="เลือกหรือถ่ายรูปของขั้นนี้"
            lotId={lotId}
            observationId={observationId}
            onUploaded={onUploaded}
            purpose="ใช้ยืนยันว่าคุณทำขั้นนี้กับของจริง"
          />
        </div>
      ) : (
        <p className="pl-card" style={{ marginTop: "14px", background: "var(--pl-sunk)" }}>{reason}</p>
      )}
    </section>
  );
}
