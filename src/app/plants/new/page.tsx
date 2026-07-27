"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { getPlantRepository } from "@/lib/repositories/plant-repository-factory";
import type { PlantRecord } from "@/lib/domain/models";
import { plantPrefillForTaxon } from "@/lib/domain/philodendron-knowledge";

export default function NewPlantPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getPlantRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [value, setValue] = useState({ taxonId: undefined as string | undefined, sellerName: "", suspectedSpecies: "", identificationConfidence: "Unknown" as PlantRecord["identificationConfidence"], source: "", receivedAt: new Date().toISOString().slice(0, 10), health: "Healthy" as PlantRecord["health"], notes: "" });
  const [baselineImage, setBaselineImage] = useState("");
  const [error, setError] = useState("");

  // Query-string prefill is a suggestion; the user must confirm identity and confidence.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const taxonId = new URLSearchParams(window.location.search).get("taxon"); const prefill = taxonId ? plantPrefillForTaxon(taxonId) : null; if (prefill) setValue((current) => ({ ...current, ...prefill })); }, []);
  const update = (field: keyof typeof value, next: string) => setValue((current) => ({ ...current, [field]: next }));

  function selectBaseline(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) { setBaselineImage(""); return; }
    if (!file.type.startsWith("image/")) { setError("รูป baseline ต้องเป็นไฟล์ภาพ"); return; }
    if (file.size > 350_000) { setError("รูป baseline ต้องมีขนาดไม่เกิน 350 KB เพื่อไม่ให้ Plant Record เกินขีดจำกัดฐานข้อมูล"); return; }
    const reader = new FileReader();
    reader.onload = () => { setBaselineImage(String(reader.result ?? "")); setError(""); };
    reader.onerror = () => setError("อ่านไฟล์รูปไม่สำเร็จ");
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.receivedAt) { setError("กรุณาระบุวันที่ได้รับต้นไม้"); return; }
    try {
      const plant = await repository.create(ownerId, { ...value, baselineMediaIds: baselineImage ? [baselineImage] : [] });
      router.push(`/plants/${plant.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "บันทึกไม่สำเร็จ");
    }
  }

  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Plants" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}>
    <Link className="route-back" href="/plants">← ต้นไม้ทั้งหมด</Link>
    <form className="experiment-surface lot-form" onSubmit={submit}>
      <div className="form-heading"><p className="eyebrow">START NEW PLANT</p><h1>บันทึกต้นไม้ต้นใหม่</h1><p>กรอกเท่าที่รู้และเพิ่มรูปทั้งต้นก่อนเริ่ม Lot รูปนี้ใช้เปรียบเทียบกับผลภายหลัง</p></div>
      {error && <p className="form-alert" role="alert">{error}</p>}
      {value.taxonId && <p className="knowledge-link-note">เชื่อมกับ Taxon Knowledge แล้ว: <Link href={`/knowledge/taxa/${value.taxonId}`}>เปิดข้อมูลชนิดพืช</Link></p>}
      <div className="form-grid">
        <Field label="ชื่อที่ผู้ขายแจ้ง"><input onChange={(e) => update("sellerName", e.target.value)} value={value.sellerName} /></Field>
        <Field label="ชนิดที่คาดว่าเป็น"><input onChange={(e) => update("suspectedSpecies", e.target.value)} placeholder="เช่น Pink Princess" value={value.suspectedSpecies} /></Field>
        <Field label="ความมั่นใจ"><select onChange={(e) => update("identificationConfidence", e.target.value)} value={value.identificationConfidence}><option>Unknown</option><option>Low</option><option>Medium</option><option>High</option></select></Field>
        <Field label="แหล่งที่มา"><input onChange={(e) => update("source", e.target.value)} placeholder="ร้าน / ผู้ขาย / งานแสดง" value={value.source} /></Field>
        <Field label="วันที่ได้รับ"><input onChange={(e) => update("receivedAt", e.target.value)} type="date" value={value.receivedAt} /></Field>
        <Field label="สุขภาพ"><select onChange={(e) => update("health", e.target.value)} value={value.health}><option>Healthy</option><option>Review</option><option>At risk</option><option>Contaminated</option></select></Field>
      </div>
      <label className="form-field"><span>รูป baseline ทั้งต้น (ไม่เกิน 350 KB)</span><input accept="image/*" onChange={selectBaseline} type="file" />{baselineImage && <Image alt="ตัวอย่างรูป baseline ที่เลือก" className="plant-baseline-preview" height={480} src={baselineImage} unoptimized width={640} />}</label>
      <label className="form-field"><span>หมายเหตุ baseline</span><textarea onChange={(e) => update("notes", e.target.value)} rows={5} value={value.notes} placeholder="ลักษณะใบ ลายด่าง อาการที่พบ…" /></label>
      <div className="form-actions"><button className="primary-button" type="submit">บันทึก Plant Record</button></div>
    </form>
  </LabShell></AuthGate>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}
