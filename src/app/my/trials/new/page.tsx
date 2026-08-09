"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { ReadinessGate } from "@/components/trials/readiness-gate";
import { JarAllocationPanel } from "@/components/trials/jar-allocation-panel";
import type { TrialArmRole } from "@/lib/domain/models";
import { resolveTrialReadiness, type TrialReadiness } from "@/lib/equipment/trial-readiness";
import { resolveBySlug } from "@/lib/manual/registry";
import {
  NADCC_VS_HAITER_TRIAL_CAVEAT,
  T3_RISK_NOTE,
  buildNaDccVsHaiterTrialLotInputs,
} from "@/lib/trials/nadcc-vs-haiter-trial";
import { allocateTrialJars } from "@/lib/trials/jar-allocation";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";

// เนื้อหาทดลอง NaDCC vs Haiter (new_idea.md หัวข้อ 15) มี doses["sterilize.dose.nadcc"] ให้ทดสอบช่วงจริง
// ในระบบแค่พันธุ์เดียวตอนนี้ จึงล็อกไว้ที่พันธุ์นี้ก่อน ไม่ใช่เพราะแม่แบบผูกกับพันธุ์นี้ถาวร
const TARGET_SLUG = "violin-variegated";
const TRIAL_ROLES = ["control-a", "control-b", "t1", "t2", "t3"] as const;
const EMPTY_ALLOCATION: Record<TrialArmRole, number> = { "control-a": 0, "control-b": 0, t1: 0, t2: 0, t3: 0 };

function CreateTrial() {
  const router = useRouter();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const equipmentRepository = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const manual = resolveBySlug(TARGET_SLUG);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState("");
  const [readiness, setReadiness] = useState<TrialReadiness | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [jarTotal, setJarTotal] = useState(0);
  const [jarReserved, setJarReserved] = useState(1);
  const [jarAllocations, setJarAllocations] = useState<Record<TrialArmRole, number>>(EMPTY_ALLOCATION);

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    equipmentRepository.get(ownerId)
      .then((profile) => {
        if (!active) return;
        setReadiness(profile ? resolveTrialReadiness(profile) : null);
        if (profile) {
          const allocation = allocateTrialJars(profile.containers.cultureJar50Ml, TRIAL_ROLES, 1);
          setJarTotal(profile.containers.cultureJar50Ml);
          setJarReserved(allocation.reserved);
          setJarAllocations(allocation.allocations);
        }
        setLoadingReadiness(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFailed(`ตรวจอุปกรณ์ไม่สำเร็จ: ${error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}`);
        setReadiness(null);
        setLoadingReadiness(false);
      });
    return () => { active = false; };
  }, [equipmentRepository, ownerId, session.status]);

  async function start() {
    const allowed = readiness?.overall === "ready" || (readiness?.overall === "experimental" && confirmed);
    const jarUsed = Object.values(jarAllocations).reduce((sum, value) => sum + value, 0) + jarReserved;
    const jarsValid = jarUsed <= jarTotal && jarReserved >= 0 && Object.values(jarAllocations).every((value) => Number.isInteger(value) && value > 0);
    if (!manual || starting || !allowed || !jarsValid) return;
    setStarting(true);
    setFailed("");
    try {
      const startedAt = new Date().toISOString().slice(0, 10);
      const inputs = buildNaDccVsHaiterTrialLotInputs(manual, startedAt, 50, {
        total: jarTotal,
        reserved: jarReserved,
        allocations: jarAllocations,
      });
      const lots = await Promise.all(inputs.map((input) => repository.createLot(ownerId, input)));
      const trialId = lots[0]?.trialId;
      if (!trialId) throw new Error("สร้างชุดทดลองไม่สำเร็จ");
      router.replace(`/my/trials/${trialId}`);
    } catch (error) {
      setFailed(`เปิดชุดทดลองไม่สำเร็จ: ${error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}`);
      setStarting(false);
    }
  }

  if (!manual) {
    return (
      <GuideShell action={<ThemeToggle />}>
        <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>
          ไม่พบคู่มือของพันธุ์ที่ชุดทดลองนี้ต้องใช้
        </p>
      </GuideShell>
    );
  }

  return (
    <GuideShell action={<ThemeToggle />}>
      <h1 className="pl-h1">เริ่มชุดทดลอง NaDCC เทียบ Haiter</h1>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        เปรียบเทียบวิธีฟอกฆ่าเชื้อและน้ำ rinse คลอรีนต่ำบน{manual.commonName} ตามแบบชุดทดลองในหัวข้อ 15 ของ new_idea.md
      </p>

      <div className="pl-card" style={{ marginTop: "18px" }}>
        <p className="pl-h2">ระบบจะเปิดห้ารอบพร้อมกัน</p>
        <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <li>Control-A · พื้นฐานเดิม (Haiter + น้ำปลอดเชื้อ)</li>
          <li>Control-B · กระปุกเปล่า ไม่มีวัสดุพืช ใช้แยกเชื้อที่มาจากอาหาร ภาชนะ หรือขั้นตอนแบ่งอาหาร</li>
          <li>T1 · Haiter + น้ำ rinse NaClO 300 ppm</li>
          <li>T2 · Haiter + น้ำ rinse NaDCC 300 ppm</li>
          <li>T3 · NaDCC เดี่ยว 300 ppm นาน 24-48 ชม. แทน Haiter ทั้งขั้น</li>
        </ul>
        <p className="pl-meta" style={{ marginTop: "12px" }}>{T3_RISK_NOTE}</p>
        <p className="pl-meta" style={{ marginTop: "8px" }}>{NADCC_VS_HAITER_TRIAL_CAVEAT}</p>
      </div>

      {failed ? (
        <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)", marginTop: "14px" }}>
          {failed}
        </p>
      ) : null}

      {jarTotal > 0 ? (
        <JarAllocationPanel
          total={jarTotal}
          reserved={jarReserved}
          allocations={jarAllocations}
          onReserved={setJarReserved}
          onAllocation={(role, value) => setJarAllocations((current) => ({ ...current, [role]: value }))}
        />
      ) : null}

      <ReadinessGate
        loading={loadingReadiness}
        readiness={readiness}
        starting={starting}
        confirmed={confirmed}
        onConfirmed={setConfirmed}
        onStart={() => void start()}
        additionalBlocker={(() => {
          if (jarTotal === 0) return "ยังไม่มีจำนวนกระปุกเพาะในหน้าอุปกรณ์";
          const used = Object.values(jarAllocations).reduce((sum, value) => sum + value, 0) + jarReserved;
          if (used > jarTotal) return `จัดสรร ${used} ใบ แต่มีจริง ${jarTotal} ใบ`;
          if (Object.values(jarAllocations).some((value) => !Number.isInteger(value) || value <= 0)) return "ทุกแขนต้องมีกระปุกเป็นจำนวนเต็มอย่างน้อย 1 ใบ";
          return "";
        })()}
      />
    </GuideShell>
  );
}

export default function NewTrialPage() {
  return (
    <AuthGate>
      <CreateTrial />
    </AuthGate>
  );
}
