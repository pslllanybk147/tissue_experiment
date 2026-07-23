"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import { getPlantRepository } from "@/lib/repositories/plant-repository-factory";
import type { PlantRecord } from "@/lib/domain/models";

export default function NewPlantPage() {
  const router = useRouter(); const { session, signOut } = useAuth(); const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getPlantRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [value, setValue] = useState({ sellerName: "", suspectedSpecies: "", identificationConfidence: "Unknown" as PlantRecord["identificationConfidence"], source: "", receivedAt: new Date().toISOString().slice(0, 10), health: "Healthy" as PlantRecord["health"], notes: "" }); const [error, setError] = useState("");
  const update = (field: keyof typeof value, next: string) => setValue((current) => ({ ...current, [field]: next }));
  async function submit(event: FormEvent) { event.preventDefault(); if (!value.receivedAt) { setError("กรุณาระบุวันที่ได้รับต้นไม้"); return; } try { const plant = await repository.create(ownerId, { ...value, baselineMediaIds: [] }); router.push(`/plants/${plant.id}`); } catch (reason) { setError(reason instanceof Error ? reason.message : "บันทึกไม่สำเร็จ"); } }
  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Plants" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}><Link className="route-back" href="/plants">← ต้นไม้ทั้งหมด</Link><form className="experiment-surface lot-form" onSubmit={submit}><div className="form-heading"><p className="eyebrow">START NEW PLANT</p><h1>บันทึกต้นไม้ต้นใหม่</h1><p>กรอกเท่าที่รู้ก่อนได้ ระบบจะเตือนเองเมื่อข้อมูลยังไม่ยืนยัน</p></div>{error && <p className="form-alert" role="alert">{error}</p>}<div className="form-grid"><Field label="ชื่อที่ผู้ขายแจ้ง"><input onChange={(e) => update("sellerName", e.target.value)} value={value.sellerName} /></Field><Field label="ชนิดที่คาดว่าเป็น"><input onChange={(e) => update("suspectedSpecies", e.target.value)} placeholder="เช่น Pink Princess" value={value.suspectedSpecies} /></Field><Field label="ความมั่นใจ"><select onChange={(e) => update("identificationConfidence", e.target.value)} value={value.identificationConfidence}><option>Unknown</option><option>Low</option><option>Medium</option><option>High</option></select></Field><Field label="แหล่งที่มา"><input onChange={(e) => update("source", e.target.value)} placeholder="ร้าน / ผู้ขาย / งานแสดง" value={value.source} /></Field><Field label="วันที่ได้รับ"><input onChange={(e) => update("receivedAt", e.target.value)} type="date" value={value.receivedAt} /></Field><Field label="สุขภาพ"><select onChange={(e) => update("health", e.target.value)} value={value.health}><option>Healthy</option><option>Review</option><option>At risk</option><option>Contaminated</option></select></Field></div><label className="form-field"><span>หมายเหตุ baseline</span><textarea onChange={(e) => update("notes", e.target.value)} rows={5} value={value.notes} placeholder="ลักษณะใบ ลายด่าง อาการที่พบ…" /></label><div className="form-actions"><button className="primary-button" type="submit">บันทึก Plant Record</button></div></form></LabShell></AuthGate>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
