"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import type { PlantRecord } from "@/lib/domain/models";
import { getPlantRepository } from "@/lib/repositories/plant-repository-factory";

export default function PlantProfilePage() {
  const params = useParams<{ plantId: string }>(); const { session, signOut } = useAuth(); const ownerId = session.user?.uid ?? "demo-owner"; const repository = useMemo(() => getPlantRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]); const [plant, setPlant] = useState<PlantRecord | null>(null); const [state, setState] = useState("loading");
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; repository.get(ownerId, params.plantId).then((item) => { setPlant(item); setState(item ? "ready" : "missing"); }).catch(() => setState("error")); }, [ownerId, params.plantId, repository, session.status]);
  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Plants" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}><Link className="route-back" href="/plants">← ต้นไม้ทั้งหมด</Link>{state === "loading" && <p className="route-state">กำลังโหลด…</p>}{state === "error" && <p className="route-state error">โหลดข้อมูลไม่สำเร็จ</p>}{state === "missing" && <p className="route-state">ไม่พบต้นไม้นี้</p>}{plant && <><div className="page-heading"><div><p className="eyebrow">PLANT PROFILE</p><h1>{plant.suspectedSpecies || "ยังไม่ระบุชนิด"}</h1><p>{plant.sellerName || "ไม่ระบุผู้ขาย"} · {plant.source || "ไม่ระบุแหล่งที่มา"}</p></div><Link className="primary-button" href={`/experiments/new?plantId=${plant.id}`}>เริ่ม Experiment Lot</Link></div><div className="profile-grid"><section className="experiment-surface"><h2>ข้อมูลตั้งต้น</h2><dl className="data-list"><dt>ความมั่นใจ</dt><dd>{plant.identificationConfidence}</dd><dt>ได้รับเมื่อ</dt><dd>{plant.receivedAt}</dd><dt>สุขภาพ</dt><dd>{plant.health}</dd><dt>หมายเหตุ</dt><dd>{plant.notes || "ยังไม่มี"}</dd></dl></section><section className="experiment-surface"><h2>ขั้นถัดไป</h2><p>เลือกวิธีทดลองและ Template แล้วระบบจะสร้างสำเนา Protocol สำหรับ Lot นี้</p><Link className="quiet-button" href={`/experiments/new?plantId=${plant.id}`}>เลือก Protocol</Link></section></div></>}</LabShell></AuthGate>;
}
