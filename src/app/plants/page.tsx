"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { LabShell } from "@/components/lab/lab-shell";
import type { PlantRecord } from "@/lib/domain/models";
import { getPlantRepository } from "@/lib/repositories/plant-repository-factory";

export default function PlantsPage() {
  const { session, signOut } = useAuth(); const ownerId = session.user?.uid ?? "demo-owner";
  const repository = useMemo(() => getPlantRepository(ownerId, session.status === "authenticated"), [ownerId, session.status]);
  const [plants, setPlants] = useState<PlantRecord[]>([]); const [state, setState] = useState("loading");
  useEffect(() => { if (session.status !== "authenticated" && session.status !== "demo") return; repository.list(ownerId).then((items) => { setPlants(items); setState("ready"); }).catch(() => setState("error")); }, [ownerId, repository, session.status]);
  return <AuthGate><LabShell onSignOut={() => void signOut()} section="Plants" sessionLabel={session.status === "authenticated" ? "FIREBASE" : "DEMO"}><div className="page-heading"><div><p className="eyebrow">PLANT RECORDS</p><h1>ต้นไม้ของฉัน</h1><p>เริ่มจากบันทึกต้นไม้หนึ่งต้น แล้วให้ระบบนำทางไปตาม Protocol</p></div><Link className="primary-button" href="/plants/new">เพิ่มต้นไม้</Link></div>{state === "loading" && <p className="route-state" role="status">กำลังโหลดต้นไม้…</p>}{state === "error" && <p className="route-state error" role="alert">โหลดข้อมูลต้นไม้ไม่สำเร็จ</p>}{state === "ready" && (plants.length ? <div className="record-list">{plants.map((plant) => <Link className="record-row" href={`/plants/${plant.id}`} key={plant.id}><div><strong>{plant.suspectedSpecies || "ยังไม่ระบุชนิด"}</strong><p>{plant.sellerName || "ไม่ระบุผู้ขาย"} · ได้รับ {plant.receivedAt}</p></div><span className="badge">{plant.identificationConfidence}</span></Link>)}</div> : <div className="empty-state"><h2>ยังไม่มี Plant Record</h2><p>เพิ่มต้นแรกเพื่อเริ่มเส้นทางแบบมีคู่มือ</p><Link className="quiet-button" href="/plants/new">เริ่มบันทึกต้นไม้</Link></div>)}</LabShell></AuthGate>;
}
