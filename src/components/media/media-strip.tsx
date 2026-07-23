"use client";
import Image from "next/image";
import { useState } from "react";
import type { ObservationMedia } from "../../lib/domain/models";

function Lightbox({ item, onClose }: { item: ObservationMedia; onClose: () => void }) {
  return (
    <div className="lightbox-overlay" onClick={onClose} style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
        <button className="lightbox-close" onClick={onClose} style={{
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

export function MediaStrip({ items, onDelete }: { items: ObservationMedia[]; onDelete: (id: string) => Promise<void> }) {
  if (!items.length) return null;
  const [lightboxItem, setLightboxItem] = useState<ObservationMedia | null>(null);

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
            <button type="button" onClick={() => void onDelete(item.id)}>
              ลบรูป
            </button>
          </figure>
        ))}
      </div>
      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </>
  );
}
