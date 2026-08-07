"use client";

// client component ตัวเดียวที่เฟส 3a เพิ่ม และเป็นข้อยกเว้นของกฎในเฟส 1 ที่ห้ามเพิ่ม
// client component ใหม่ เหตุผลคือการรับพิกัดจากการคลิกต้องใช้ JavaScript จริง
// ยกเว้นได้เพราะอยู่ในโซน /admin ซึ่งไม่ใช่หน้าผู้ใช้ หน้าสาธารณะทุกหน้ายังเป็น
// Server Component ล้วนตามเดิม ดูสเปก 2026-08-06-form-reference-images-design.md ส่วนที่ 6

import { useState, type MouseEvent } from "react";

import { appendPin, pinSnippet, toFraction, type Picked } from "./pin-picker-logic";

export type PinPickerForm = {
  id: string;
  label: string;
  /** ชื่อไฟล์ใน public/forms/ หรือ null เมื่อทรงนั้นยังไม่ประกาศภาพ */
  file: string | null;
  landmarks: { id: string; term: string }[];
};

export function PinPicker({ forms }: { forms: PinPickerForm[] }) {
  const [formId, setFormId] = useState(forms[0]?.id ?? "");
  const [picked, setPicked] = useState<Picked[]>([]);

  const form = forms.find((item) => item.id === formId) ?? null;

  function handleClick(event: MouseEvent<HTMLImageElement>) {
    if (!form) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = toFraction(event.clientX - rect.left, rect.width);
    const y = toFraction(event.clientY - rect.top, rect.height);
    // ส่ง current เข้าไปทาง updater ไม่ใช่อ่านจาก closure ดูเหตุผลใน pin-picker-logic.ts
    setPicked((current) => appendPin(current, form.landmarks, x, y));
  }

  const nextLandmark = form?.landmarks[picked.length] ?? null;

  const snippet = pinSnippet(picked);

  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "900px" }}>
      <h1>ปักหมุดจุดสังเกตบนภาพของทรง</h1>

      <p>
        <label>
          ทรง{" "}
          <select
            value={formId}
            onChange={(event) => {
              setFormId(event.target.value);
              setPicked([]);
            }}
          >
            {forms.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>{" "}
        <button type="button" onClick={() => setPicked([])}>เริ่มปักใหม่</button>
      </p>

      {!form ? null : !form.file ? (
        <p>
          ทรงนี้ยังไม่ประกาศภาพ วางไฟล์ไว้ที่ <code>public/forms/{form.id}.jpg</code> แล้วเพิ่ม
          <code> referenceImage </code> ในไฟล์ทรงก่อน จึงจะปักหมุดได้
        </p>
      ) : (
        <>
          <p>
            {nextLandmark
              ? `คลิกบนภาพเพื่อปักหมุดของ "${nextLandmark.term}"`
              : "ปักครบทุกจุดแล้ว คัดลอกโค้ดข้างล่างไปวางในไฟล์ทรง"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/forms/${form.file}`}
            alt={`ภาพของทรง ${form.label} สำหรับปักหมุด`}
            onClick={handleClick}
            style={{ maxWidth: "100%", cursor: nextLandmark ? "crosshair" : "default" }}
          />
        </>
      )}

      {picked.length > 0 ? (
        <>
          <h2>โค้ดสำหรับคัดลอก</h2>
          <pre style={{ background: "#f4f4f4", padding: "12px", overflowX: "auto" }}>{snippet}</pre>
        </>
      ) : null}
    </main>
  );
}
