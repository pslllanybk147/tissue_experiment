"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { useIsOnline } from "@/components/rounds/online-status";
import { StepRunner, type StepSaveInput } from "@/components/rounds/step-runner";
import { T3LockPanel } from "@/components/trials/t3-lock-panel";
import { calibrationKey, type CalibrationEntry } from "@/lib/domain/calibration";
import type { LotSterilizationSnapshot, ObservationMedia } from "@/lib/domain/models";
import { resolveBySlug } from "@/lib/manual/registry";
import {
  bracketKey,
  buildBracketPlan,
  chooseBracketWinner,
  jarsPerArmKey,
  type BracketResult,
} from "@/lib/rounds/bracket";
import { getCalibrationRepository } from "@/lib/repositories/calibration-repository-factory";
import { buildRoundView, MANUAL_VERSION_ID, type RoundTrialContext, type RoundView } from "@/lib/rounds/round-adapter";
import { defaultKit, type EquipmentKit } from "@/lib/equipment/resolve-path";
import { evidenceObservationInput, findEvidenceObservation } from "@/lib/rounds/step-evidence";
import { getExperimentRepository } from "@/lib/repositories/experiment-repository-factory";
import { getEquipmentRepository } from "@/lib/repositories/equipment-repository-factory";
import { getMediaRepository } from "@/lib/repositories/media-repository-factory";
import { getStepRunRepository } from "@/lib/repositories/step-run-repository-factory";

export default function RoundStepPage() {
  const { roundId, step } = useParams<{ roundId: string; step: string }>();
  const { session } = useAuth();
  const ownerId = session.user?.uid ?? "demo-owner";
  const authenticated = session.status === "authenticated";
  const lots = useMemo(() => getExperimentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const runs = useMemo(() => getStepRunRepository(ownerId, authenticated), [ownerId, authenticated]);
  const mediaRepo = useMemo(() => getMediaRepository(ownerId, authenticated), [ownerId, authenticated]);
  const equipment = useMemo(() => getEquipmentRepository(ownerId, authenticated), [ownerId, authenticated]);
  const online = useIsOnline();
  const [view, setView] = useState<RoundView | null>(null);
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [evidenceObservationId, setEvidenceObservationId] = useState<string | null>(null);
  const [media, setMedia] = useState<ObservationMedia[]>([]);
  const [kit, setKit] = useState<EquipmentKit>(defaultKit);
  const calibration = useMemo(() => getCalibrationRepository(ownerId, authenticated), [ownerId, authenticated]);
  const [remembered, setRemembered] = useState<CalibrationEntry | null>(null);

  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;

    async function load() {
      const lot = await lots.getLot(ownerId, roundId);
      if (!lot) {
        if (active) setMessage("ไม่พบรอบนี้ อาจถูกลบไปแล้ว");
        return;
      }
      const manual = resolveBySlug(lot.protocolId);
      if (!manual) {
        if (active) setMessage("รอบนี้อ้างคู่มือที่ไม่มีในระบบแล้ว");
        return;
      }
      const stepRuns = await runs.list(ownerId, roundId);
      let trialContext: RoundTrialContext | undefined;
      if (lot.armRole === "t3" && lot.trialId) {
        const trialLots = (await lots.listLots(ownerId)).filter((item) => item.trialId === lot.trialId);
        const trialRuns = (await Promise.all(trialLots.map((item) => runs.list(ownerId, item.id)))).flat();
        trialContext = { trialLots, trialRuns };
      }
      const nextView = buildRoundView(lot, stepRuns, manual, trialContext);
      if (!active) return;
      setView(nextView);

      // หา observation ที่ใช้แขวนรูปของขั้นนี้ ถ้ายังไม่มีก็ปล่อยว่างไว้
      // แล้วค่อยสร้างตอนผู้ใช้จะแนบรูปจริง จะได้ไม่สร้างรายการเปล่าทิ้งไว้เต็มไปหมด
      const stepNumber = Number(step);
      const currentStep = nextView.steps[stepNumber - 1];
      if (!currentStep) return;
      const observations = await lots.listObservations(ownerId, roundId);
      const evidence = findEvidenceObservation(observations, currentStep.id);
      if (!active) return;
      setEvidenceObservationId(evidence?.id ?? null);
      if (evidence) {
        const items = await mediaRepo.list(ownerId, roundId, evidence.id);
        if (active) setMedia(items);
      } else if (active) {
        setMedia([]);
      }
    }

    load().catch(() => active && setMessage("โหลดขั้นตอนไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
    return () => {
      active = false;
    };
  }, [lots, mediaRepo, ownerId, reloadKey, roundId, runs, session.status, step]);

  const number = Number(step);
  const current = view && Number.isInteger(number) && number >= 1 && number <= view.steps.length
    ? view.steps[number - 1]
    : null;

  // แนบรูปได้ต่อเมื่อออนไลน์และล็อกอินด้วยบัญชีจริง เพราะการอัปโหลดต้องขอลายเซ็นจากเซิร์ฟเวอร์
  // ด้วย token ของผู้ใช้ โหมดสาธิตจึงทำไม่ได้ ต้องบอกเหตุผลแทนการซ่อนปุ่มเงียบ ๆ
  const canAttach = authenticated && online;
  const attachReason = !online
    ? "ตอนนี้ออฟไลน์จึงแนบรูปไม่ได้ ถ่ายเก็บไว้ในเครื่องก่อนแล้วค่อยกลับมาแนบเมื่อกลับมาออนไลน์"
    : "โหมดสาธิตยังแนบรูปไม่ได้ ต้องเข้าสู่ระบบด้วยบัญชีจริงก่อน เพราะการอัปโหลดต้องยืนยันตัวตนกับเซิร์ฟเวอร์";

  // สร้างที่แขวนรูปให้ขั้นนี้เมื่อเข้าเงื่อนไขแนบได้แล้วเท่านั้น จะได้ไม่สร้างรายการเปล่า
  // ให้กับขั้นที่ผู้ใช้แค่เปิดผ่านตาในโหมดสาธิต
  const preparing = useRef(false);
  useEffect(() => {
    if (!view || !current || evidenceObservationId || !canAttach) return;
    if (preparing.current) return;
    preparing.current = true;
    lots
      .createObservation(ownerId, roundId, evidenceObservationInput(current.id, new Date().toISOString()))
      .then((created) => setEvidenceObservationId(created.id))
      .catch(() => setMessage("เตรียมพื้นที่แนบรูปไม่สำเร็จ ลองรีเฟรชอีกครั้ง"))
      .finally(() => {
        preparing.current = false;
      });
  }, [canAttach, current, evidenceObservationId, lots, ownerId, roundId, view]);

  // ดึงชุดอุปกรณ์ที่บันทึกไว้มาป้อนเครื่องคำนวณ ผู้ใช้จะได้ไม่ต้องกรอกความละเอียดเครื่องมือซ้ำทุกครั้ง
  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    let active = true;
    equipment
      .get(ownerId)
      .then((found) => {
        if (active && found) setKit({ ...defaultKit, ...found });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [equipment, ownerId, session.status]);

  // ดึงค่าที่ผู้ใช้เคยทดสอบได้ของขั้นนี้มาแสดง ผู้ใช้จะได้ไม่ต้องเปิดรอบเก่าหาเอง
  useEffect(() => {
    if (!["demo", "authenticated"].includes(session.status)) return;
    if (!view || !current) return;
    let active = true;
    const plan = buildBracketPlan(current);
    // ตั้งค่า state ในผลของ promise เสมอ ไม่ตั้งตรง ๆ ในตัว effect
    // เพราะการตั้ง state แบบ synchronous ที่นี่ทำให้เกิด cascading render
    const load = plan ? calibration.list(ownerId) : Promise.resolve([]);
    load
      .then((entries) => {
        if (!active) return;
        if (!plan) {
          setRemembered(null);
          return;
        }
        const key = calibrationKey(view.slug, current.id, plan.doseKey);
        setRemembered(
          entries.find((item) => calibrationKey(item.slug, item.stepId, item.doseKey) === key) ?? null,
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [calibration, current, ownerId, session.status, view]);

  const onUploaded = useCallback(async (item: ObservationMedia) => {
    await mediaRepo.save(ownerId, item);
    setMedia((items) => [...items, item]);
  }, [mediaRepo, ownerId]);

  const save = useCallback(async (input: StepSaveInput) => {
    if (!view || !current) return;
    if (view.trialArmRole === "t3" && view.t3Eligibility && !view.t3Eligibility.unlocked && input.status === "Passed") {
      throw new Error("T3 ยังถูกล็อก รอผล T1 และ T2 หรือยืนยันความเสี่ยงก่อน");
    }
    await runs.save(ownerId, {
      lotId: view.lotId,
      protocolId: view.slug,
      versionId: MANUAL_VERSION_ID,
      stepId: current.id,
      status: input.status,
      note: input.note,
      measurements: input.measurements,
      responses: input.responses,
      mediaIds: media.filter((item) => !item.deletedAt).map((item) => item.id),
      evidenceObservationId: evidenceObservationId ?? undefined,
      observedAt: new Date().toISOString(),
      completionMode: "live",
    });

    // ถ้ากรอกครบและมีชุดที่ใช้ได้ ให้จำค่านั้นไว้ ผู้ใช้จะได้ไม่ต้องทดสอบซ้ำในรอบถัดไป
    // ค่านี้ไม่เปลี่ยนระดับหลักฐานของขั้น เพราะการทดลองของคนเดียวไม่ใช่งานที่ผ่านการทบทวน
    const plan = buildBracketPlan(current);
    if (plan) {
      const jars = input.measurements[jarsPerArmKey()] ?? 0;
      const results: BracketResult[] = plan.arms.map((arm) => ({
        armId: arm.armId,
        dose: arm.dose,
        clean: input.measurements[bracketKey(arm.armId, "clean")] ?? 0,
        alive: input.measurements[bracketKey(arm.armId, "alive")] ?? 0,
        usable: input.measurements[bracketKey(arm.armId, "usable")] ?? 0,
      }));
      const outcome = chooseBracketWinner(results, jars);
      if (outcome.kind === "winner") {
        const entry: CalibrationEntry = {
          slug: view.slug,
          stepId: current.id,
          doseKey: plan.doseKey,
          value: outcome.dose,
          unit: plan.dose.unit,
          jarsPerArm: jars,
          usable: results.find((item) => item.armId === outcome.armId)?.usable ?? 0,
          lotId: view.lotId,
          decidedAt: new Date().toISOString().slice(0, 10),
        };
        await calibration.save(ownerId, entry);
        setRemembered(entry);
      }
    }

    setReloadKey((key) => key + 1);
  }, [calibration, current, evidenceObservationId, media, ownerId, runs, view]);

  const overrideT3 = useCallback(async (reason: string) => {
    if (!view || view.trialArmRole !== "t3") throw new Error("รอบนี้ไม่ใช่ T3");
    await lots.saveT3Override(ownerId, view.lotId, {
      reason,
      acknowledged: true,
      recordedAt: new Date().toISOString(),
      mode: authenticated ? "risk-override" : "demo-only",
    });
    setReloadKey((key) => key + 1);
  }, [authenticated, lots, ownerId, view]);

  const confirmPreparation = useCallback(async (snapshot: LotSterilizationSnapshot) => {
    if (!view) return;
    await lots.updateSterilization(ownerId, view.lotId, snapshot);
    setReloadKey((key) => key + 1);
  }, [lots, ownerId, view]);

  return (
    <AuthGate>
      <GuideShell action={<ThemeToggle />}>
        {message ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>{message}</p>
        ) : null}
        {!view && !message ? <p className="pl-lede" role="status">กำลังโหลด…</p> : null}
        {view && !current ? (
          <p className="pl-card" role="alert" style={{ background: "var(--pl-stop)" }}>
            ไม่มีขั้นที่ {step} ในคู่มือนี้
          </p>
        ) : null}
        {view && current ? (
          <>
            {view.t3Eligibility ? (
              <T3LockPanel eligibility={view.t3Eligibility} demoMode={!authenticated} onOverride={overrideT3} />
            ) : null}
            <StepRunner
              view={view}
              step={current}
              onSave={save}
              onConfirmPreparation={confirmPreparation}
              photos={{ observationId: evidenceObservationId, media, canAttach, reason: attachReason, onUploaded }}
              tools={{
                scaleMinimumMg: kit.scaleMinimumMg,
                pipetteMinimumMl: kit.pipetteMinimumMl,
                msLabelRateGPerL: kit.msLabelRateGPerL,
                bcdLabelRateGPerL: kit.bcdLabelRateGPerL,
                naaStockMgPerMl: kit.naaStockMgPerMl,
                baStockMgPerMl: kit.baStockMgPerMl,
                ibaStockMgPerMl: kit.ibaStockMgPerMl,
              }}
              remembered={remembered}
              locked={Boolean(view.t3Eligibility && !view.t3Eligibility.unlocked)}
              lockReason="T3 ยังถูกล็อก รอผล T1 และ T2 ให้ครบ หรือยืนยันความเสี่ยงก่อน"
              demoMode={!authenticated}
            />
          </>
        ) : null}
      </GuideShell>
    </AuthGate>
  );
}
