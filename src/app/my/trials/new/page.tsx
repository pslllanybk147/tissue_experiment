"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { resolveBySlug } from "@/lib/manual/registry";
import { NADCC_VS_HAITER_TRIAL_CAVEAT, buildNaDccVsHaiterTrialLotInputs } from "@/lib/trials/nadcc-vs-haiter-trial";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";

// เนื้อหาทดลอง NaDCC vs Haiter (new_idea.md หัวข้อ 15) มี doses["sterilize.dose.nadcc"] ให้ทดสอบช่วงจริง
// ในระบบแค่พันธุ์เดียวตอนนี้ จึงล็อกไว้ที่พันธุ์นี้ก่อน ไม่ใช่เพราะแม่แบบผูกกับพันธุ์นี้ถาวร
const TARGET_SLUG = "violin-variegated";

function CreateTrial() {
  const router = useRouter();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const repository = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const manual = resolveBySlug(TARGET_SLUG);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    if (!manual || starting) return;
    setStarting(true);
    setFailed(false);
    try {
      const startedAt = new Date().toISOString().slice(0, 10);
      const inputs = buildNaDccVsHaiterTrialLotInputs(manual, startedAt);
      const lots = await Promise.all(inputs.map((input) => repository.createLot(ownerId, input)));
      const trialId = lots[0]?.trialId;
      if (!trialId) throw new Error("สร้างชุดทดลองไม่สำเร็จ");
      router.replace(`/my/trials/${trialId}`);
    } catch {
      setFailed(true);
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
        เปรียบเทียบน้ำ rinse คลอรีนต่ำสองแบบหลังฟอกฆ่าเชื้อหลักด้วย Haiter บน{manual.commonName} ตามแบบชุดทดลองในหัวข้อ 15 ของ new_idea.md
      </p>

      <div className="pl-card" style={{ marginTop: "18px" }}>
        <p className="pl-h2">ระบบจะเปิดสี่รอบพร้อมกัน</p>
        <ul style={{ margin: "10px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <li>Control-A · พื้นฐานเดิม (Haiter + น้ำปลอดเชื้อ)</li>
          <li>Control-B · กระปุกเปล่า ไม่มี explant เพื่อแยกว่าปนเปื้อนมาจากอาหาร/ภาชนะ</li>
          <li>T1 · Haiter + น้ำ rinse NaClO 300 ppm</li>
          <li>T2 · Haiter + น้ำ rinse NaDCC 300 ppm</li>
        </ul>
        <p className="pl-meta" style={{ marginTop: "12px" }}>{NADCC_VS_HAITER_TRIAL_CAVEAT}</p>
      </div>

      {failed ? (
        <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)", marginTop: "14px" }}>
          เปิดชุดทดลองไม่สำเร็จ ลองใหม่อีกครั้ง
        </p>
      ) : null}

      <p style={{ marginTop: "18px" }}>
        <button
          type="button"
          className="pl-chip"
          disabled={starting}
          onClick={() => void start()}
          style={{ background: "var(--pl-yellow)", cursor: starting ? "default" : "pointer", fontSize: "15px", padding: "10px 18px" }}
        >
          {starting ? "กำลังเปิดสี่รอบ…" : "เริ่มชุดทดลอง"}
        </button>
      </p>
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
