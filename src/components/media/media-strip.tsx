"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ObservationMedia } from "../../lib/domain/models";

function Lightbox({ item, onClose }: { item: ObservationMedia; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true" aria-label="ขยายภาพ observation" onClick={onClose} style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <button ref={closeRef} aria-label="ปิดภาพขยาย" className="lightbox-close" onClick={onClose} style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer"
        }}>✕</button>
        <Image
          src={item.secureUrl}
          alt={item.caption || "ภาพ observation"}
          width={item.width}
          height={item.height}
          unoptimized
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        />
        {item.caption && (
          <figcaption style={{ color: "white", marginTop: 8 }}>{item.caption}</figcaption>
        )}
      </div>
    </div>
  );
}

function DatasetIntakeAction({ item, onAdd }: { item: ObservationMedia; onAdd: (item: ObservationMedia) => Promise<void> }) {
  const [state, setState] = useState<"idle" | "busy" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function submit() {
    setState("busy"); setError("");
    try { await onAdd(item); setState("success"); } catch (cause) { setState("error"); setError(cause instanceof Error ? cause.message : "ส่งรูปไม่สำเร็จ"); }
  }
  return <><button disabled={state === "busy" || state === "success"} type="button" onClick={() => void submit()}>{state === "busy" ? "กำลังส่ง…" : state === "success" ? "ส่งแล้ว · รอตรวจ" : "ส่งเข้า Image review"}</button>{state === "error" && <small className="field-error" role="alert">{error}</small>}</>;
}

export function MediaStrip({ items, onDelete, onRestore, onAddToDataset }: { items: ObservationMedia[]; onDelete: (id: string) => Promise<void>; onRestore?: (id: string) => Promise<void>; onAddToDataset?: (item: ObservationMedia) => Promise<void> }) {
  const [lightboxItem, setLightboxItem] = useState<ObservationMedia | null>(null);

  if (!items.length) return null;

  return (
    <>
      <div className="media-strip">
        {items.map(item => (
          <figure key={item.id} style={{ margin: "0 8px" }}>
            <Image
              alt={item.caption || "ภาพ observation"}
              height={item.height}
              src={item.secureUrl}
              unoptimized
              width={item.width}
              style={{ cursor: "pointer" }}
              onClick={() => setLightboxItem(item)}
            />
            {item.caption && <figcaption>{item.caption}</figcaption>}
            {item.deletedAt ? <button type="button" onClick={() => onRestore && void onRestore(item.id)}>กู้คืนรูป</button> : <>{onAddToDataset && <DatasetIntakeAction item={item} onAdd={onAddToDataset} />}<button type="button" onClick={() => void onDelete(item.id)}>ลบรูป</button></>}
          </figure>
        ))}
      </div>
      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </>
  );
}
