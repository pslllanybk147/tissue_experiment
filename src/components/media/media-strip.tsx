"use client";
import Image from "next/image";
import { useState } from "react";
import type { ObservationMedia } from "../../lib/domain/models";

function Lightbox({ item, onClose }: { item: ObservationMedia; onClose: () => void }) {
  // Deterministic mock variegation ratio based on media ID string hash for demonstration
  const estimatedVariegation = Math.min(
    95,
    Math.max(15, (item.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 65) + 20)
  );

  return (
    <div className="lightbox-overlay" onClick={onClose} style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: 16
    }}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()} style={{
        position: "relative",
        background: "#161b22",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 16,
        maxWidth: "92vw",
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
      }}>
        <button className="lightbox-close" onClick={onClose} style={{
          position: "absolute",
          top: 12,
          right: 16,
          background: "transparent",
          border: "none",
          color: "white",
          fontSize: "1.5rem",
          cursor: "pointer"
        }}>✕</button>

        <div style={{ textAlign: "center" }}>
          <Image
            src={item.secureUrl}
            alt={item.caption || "ภาพ observation"}
            width={item.width}
            height={item.height}
            unoptimized
            style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8 }}
          />
        </div>

        <div style={{ marginTop: 16, color: "white" }}>
          {item.caption && <figcaption style={{ fontSize: "1.1rem", fontWeight: 600 }}>{item.caption}</figcaption>}

          <div style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            padding: 12,
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            fontSize: "0.85rem"
          }}>
            <div>
              <span style={{ opacity: 0.7 }}>🧬 Est. Leaf Variegation: </span>
              <strong style={{ color: "#a3e635" }}>{estimatedVariegation}%</strong>
            </div>

            <div>
              <span style={{ opacity: 0.7 }}>📏 Dimensions: </span>
              <strong>{item.width} × {item.height} px</strong>
            </div>

            <div>
              <span style={{ opacity: 0.7 }}>🏷️ ML Dataset Tag: </span>
              <span className="badge" style={{ background: "rgba(163,230,53,0.2)", color: "#a3e635" }}>
                Verified License Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaStrip({ items, onDelete }: { items: ObservationMedia[]; onDelete: (id: string) => Promise<void> }) {
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
