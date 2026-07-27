"use client";

import { useMemo, useState, type FormEvent } from "react";

import { createHaiterActionPlan } from "../../lib/domain/haiter-guidance";
import { calculateMediumBatchPlan } from "../../lib/domain/medium-batch-calculations";
import { validateLotInput } from "../../lib/domain/experiment-validation";
import type {
  CreateLotInput,
  ProtocolTemplate,
  SterilizationProfile,
} from "../../lib/domain/models";
import type { ProtocolOption } from "./lot-form";

type BeginnerLotWizardProps = {
  onSubmit: (input: CreateLotInput) => Promise<void>;
  protocolOptions: ProtocolOption[];
  profiles: SterilizationProfile[];
  templates: ProtocolTemplate[];
  initialPlantId?: string;
  initialPlantName?: string;
  initialTaxonId?: string;
  initialTemplateId?: string;
  onAdvancedMode?: () => void;
};

const wizardStages = [
  "เพิ่มต้นไม้",
  "เลือกเป้าหมาย",
  "เลือกวิธีฆ่าเชื้อ",
  "ตรวจอุปกรณ์",
  "สร้าง Lot",
];

export function createSuggestedLotId(now = new Date()) {
  const timestamp = now.toISOString().replaceAll("-", "").replaceAll(":", "");
  return `LOT-${timestamp.slice(0, 8)}-${timestamp.slice(9, 15)}`;
}

export function BeginnerLotWizard({
  onSubmit,
  protocolOptions,
  profiles,
  templates,
  initialPlantId,
  initialPlantName = "",
  initialTaxonId,
  initialTemplateId,
  onAdvancedMode,
}: BeginnerLotWizardProps) {
  const [stage, setStage] = useState(initialPlantName ? 2 : 1);
  const [plant, setPlant] = useState(initialPlantName);
  const [templateId, setTemplateId] = useState(
    initialTemplateId ?? templates[0]?.id ?? "",
  );
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [sourcePercent, setSourcePercent] = useState("");
  const [targetPercent, setTargetPercent] = useState("0.003");
  const [explantCount, setExplantCount] = useState("1");
  const [cultureJarCount, setCultureJarCount] = useState("1");
  const [blankJarCount, setBlankJarCount] = useState("1");
  const [spareJarCount, setSpareJarCount] = useState("2");
  const [mediumPerJarMl, setMediumPerJarMl] = useState("25");
  const [lossPercent, setLossPercent] = useState("10");
  const [minimumMeasurableMl, setMinimumMeasurableMl] = useState("0.1");
  const [equipmentReady, setEquipmentReady] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const profile = profiles.find((item) => item.id === profileId);
  const template = templates.find((item) => item.id === templateId);
  const protocol = protocolOptions[0];
  const mediumPlan = useMemo(() => {
    try {
      return calculateMediumBatchPlan({
        explantCount: Number(explantCount),
        cultureJarCount: Number(cultureJarCount),
        blankJarCount: Number(blankJarCount),
        spareJarCount: Number(spareJarCount),
        mediumPerJarMl: Number(mediumPerJarMl),
        lossPercent: Number(lossPercent),
      });
    } catch {
      return null;
    }
  }, [blankJarCount, cultureJarCount, explantCount, lossPercent, mediumPerJarMl, spareJarCount]);
  const mediumVolumeMl = String(mediumPlan?.totalVolumeMl ?? 0);
  const haiterPlan = useMemo(() => {
    if (profile?.method !== "haiter-chemical") return null;
    return createHaiterActionPlan({
      labelPercent: sourcePercent.trim() ? Number(sourcePercent) : null,
      targetPercent: Number(targetPercent),
      mediumVolumeMl: Number(mediumVolumeMl),
      minimumToolVolumeMl: Number(minimumMeasurableMl),
      permittedDiluent: "น้ำปลอดเชื้อ",
    });
  }, [
    mediumVolumeMl,
    minimumMeasurableMl,
    profile?.method,
    sourcePercent,
    targetPercent,
  ]);

  const equipmentComplete = profile?.equipmentRequirements.every(
    (item) => equipmentReady[item],
  ) ?? false;

  function canContinue() {
    if (stage === 1) return plant.trim().length > 0;
    if (stage === 2) return Boolean(template);
    if (stage === 3) return Boolean(mediumPlan && !mediumPlan.warnings.length) && (profile?.method === "pressure-sterilization" || haiterPlan?.state === "direct" || haiterPlan?.state === "working-dilution");
    if (stage === 4) return equipmentComplete;
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || !template) return;
    const input: CreateLotInput = {
      id: createSuggestedLotId(),
      plant: plant.trim(),
      plantId: initialPlantId,
      taxonId: initialTaxonId,
      templateId: template.id,
      method: template.method,
      protocolId: protocol?.id ?? template.protocolId ?? "protocol-guided-template",
      protocolTitle: protocol?.title ?? template.title,
      protocolVersionId: protocol?.versionId,
      stage: "Establishment",
      status: "Healthy",
      startedAt: new Date().toISOString().slice(0, 10),
      sterilization: {
        profileId: profile.id,
        profileVersion: profile.version,
        method: profile.method,
        lockedAt: new Date().toISOString(),
        activeChlorinePercent: profile.method === "haiter-chemical" ? Number(sourcePercent) : undefined,
        targetChlorinePercent: profile.method === "haiter-chemical" ? Number(targetPercent) : undefined,
        mediumVolumeMl: profile.method === "haiter-chemical" ? Number(mediumVolumeMl) : undefined,
        calculatedDoseMl: profile.method === "haiter-chemical" && haiterPlan && haiterPlan.state !== "blocked"
          ? haiterPlan.directDoseMl
          : undefined,
      },
    };
    const result = validateLotInput(input);
    if (!result.ok) {
      setError(Object.values(result.errors)[0] ?? "ข้อมูลยังไม่ครบ");
      return;
    }
    setPending(true);
    setError("");
    try {
      await onSubmit(result.value);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "สร้าง Lot ไม่สำเร็จ");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="beginner-wizard experiment-surface" onSubmit={submit}>
      <header className="wizard-header">
        <p className="eyebrow">FIRST EXPERIMENT</p>
        <h1>เริ่มจากต้นไม้ 1 ต้น</h1>
        <p>ระบบจะพาเตรียมอาหารและพื้นที่ให้พร้อม ก่อนเปิดขั้นตัดต้นไม้</p>
      </header>

      <ol aria-label="ขั้นตอนเริ่มการทดลอง" className="wizard-progress">
        {wizardStages.map((label, index) => (
          <li
            aria-current={stage === index + 1 ? "step" : undefined}
            className={stage === index + 1 ? "is-current" : stage > index + 1 ? "is-done" : ""}
            key={label}
          >
            <span>{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="wizard-progress-mobile">
        ขั้นที่ {stage} จาก {wizardStages.length} · {wizardStages[stage - 1]}
      </p>

      <aside className="wizard-method-summary" aria-label="วิธีฆ่าเชื้อที่ระบบรองรับ">
        <strong>วิธีที่เลือกได้:</strong>
        {profiles.map((item) => (
          <span key={item.id}>
            {item.method === "haiter-chemical" ? "ไฮเตอร์ / NaOCl" : "หม้อนึ่งแรงดัน"}
          </span>
        ))}
        <p>ถ้าเลือกไฮเตอร์ ให้กรอกตัวเลขเปอร์เซ็นต์ที่พิมพ์อยู่บนฉลาก ระบบจะคำนวณและบอกวิธีตวงให้</p>
        <button className="text-button" type="button">หาเปอร์เซ็นต์ไม่เจอ</button>
      </aside>
      <p className="wizard-guard wizard-guard-global">
        <strong>อย่าเพิ่งตัดต้นไม้</strong> ระบบจะเปิดขั้นตัดหลังอาหาร อุปกรณ์ และพื้นที่พร้อมแล้ว
      </p>

      {error && <p className="form-alert" role="alert">{error}</p>}

      <section className="wizard-step" aria-labelledby={`wizard-stage-${stage}`}>
        {stage === 1 && (
          <>
            <p className="eyebrow">STEP 1</p>
            <h2 id="wizard-stage-1">เพิ่มหรือยืนยันต้นไม้</h2>
            <label className="form-field">
              <span>ชื่อที่ผู้ขายแจ้งหรือชื่อที่คาดว่าเป็น</span>
              <input
                onChange={(event) => setPlant(event.target.value)}
                placeholder="เช่น Pink Princess"
                value={plant}
              />
            </label>
          </>
        )}

        {stage === 2 && (
          <>
            <p className="eyebrow">STEP 2</p>
            <h2 id="wizard-stage-2">เลือกเป้าหมายและคู่มือ</h2>
            <div className="wizard-choice-grid">
              {templates.map((item) => (
                <button
                  aria-pressed={templateId === item.id}
                  className="wizard-choice"
                  key={item.id}
                  onClick={() => setTemplateId(item.id)}
                  type="button"
                >
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                  <small>{item.evidenceState}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {stage === 3 && (
          <>
            <p className="eyebrow">STEP 3</p>
            <h2 id="wizard-stage-3">เลือกวิธีฆ่าเชื้ออาหาร</h2>
            <p className="wizard-guard"><strong>อย่าเพิ่งตัดต้นไม้</strong> ขั้นตัดจะเปิดเมื่ออาหารและพื้นที่พร้อมแล้ว</p>
            <div className="wizard-choice-grid">
              {profiles.map((item) => (
                <button
                  aria-pressed={profileId === item.id}
                  className="wizard-choice"
                  key={item.id}
                  onClick={() => setProfileId(item.id)}
                  type="button"
                >
                  <strong>{item.method === "haiter-chemical" ? "ไฮเตอร์ / NaOCl" : "หม้อนึ่งแรงดัน"}</strong>
                  <span>{item.title}</span>
                  <small>{item.evidenceState}</small>
                </button>
              ))}
            </div>
            {profile?.method === "haiter-chemical" && (
              <div className="wizard-calculation">
                <label className="form-field"><span>ตัวเลขเปอร์เซ็นต์ที่พิมพ์อยู่บนฉลาก</span><input inputMode="decimal" onChange={(event) => setSourcePercent(event.target.value)} placeholder="เช่น 6 — ถ้าหาไม่เจอให้หยุด" value={sourcePercent} /></label>
                <label className="form-field"><span>% เป้าหมายตาม Protocol</span><input inputMode="decimal" onChange={(event) => setTargetPercent(event.target.value)} value={targetPercent} /></label>
                <fieldset className="medium-batch-planner">
                  <legend>ให้ระบบหาปริมาตรอาหารจากจำนวนกระปุก</legend>
                  <label className="form-field"><span>จำนวน explant</span><input inputMode="numeric" min="1" onChange={(event) => setExplantCount(event.target.value)} type="number" value={explantCount} /></label>
                  <label className="form-field"><span>กระปุกเพาะ</span><input inputMode="numeric" min="1" onChange={(event) => setCultureJarCount(event.target.value)} type="number" value={cultureJarCount} /></label>
                  <label className="form-field"><span>Blank control</span><input inputMode="numeric" min="1" onChange={(event) => setBlankJarCount(event.target.value)} type="number" value={blankJarCount} /></label>
                  <label className="form-field"><span>กระปุกสำรอง</span><input inputMode="numeric" min="1" onChange={(event) => setSpareJarCount(event.target.value)} type="number" value={spareJarCount} /></label>
                  <label className="form-field"><span>อาหารต่อกระปุก (mL)</span><input inputMode="decimal" min="1" onChange={(event) => setMediumPerJarMl(event.target.value)} type="number" value={mediumPerJarMl} /></label>
                  <label className="form-field"><span>เผื่อสูญเสีย (%)</span><input inputMode="decimal" min="0" onChange={(event) => setLossPercent(event.target.value)} type="number" value={lossPercent} /></label>
                </fieldset>
                {mediumPlan && <div className="medium-batch-result"><strong>เตรียมอาหารทั้งหมด {mediumPlan.totalVolumeMl} mL</strong><p>{mediumPlan.totalJarCount} กระปุก · ปริมาตรใช้งาน {mediumPlan.baseVolumeMl} mL · เผื่อสูญเสีย {mediumPlan.lossAllowanceMl.toFixed(1)} mL</p>{mediumPlan.warnings.map((warning) => <p className="form-alert" key={warning}>{warning}</p>)}</div>}
                <label className="form-field"><span>เครื่องมือวัดได้ต่ำสุด (mL)</span><input inputMode="decimal" onChange={(event) => setMinimumMeasurableMl(event.target.value)} value={minimumMeasurableMl} /></label>
                {haiterPlan?.state === "blocked" && (
                  <div className="calculation-result" role="alert">
                    <strong>{haiterPlan.reason}</strong>
                    <p>{haiterPlan.safeAction}</p>
                  </div>
                )}
                {haiterPlan && haiterPlan.state !== "blocked" && (
                  <div className="calculation-result">
                    <strong>{haiterPlan.primaryInstruction}</strong>
                    <ol>{haiterPlan.actions.map((action) => <li key={action}>{action}</li>)}</ol>
                    <details>
                      <summary>เหตุผลทางวิทยาศาสตร์</summary>
                      <p>{haiterPlan.scienceNote}</p>
                    </details>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {stage === 4 && profile && (
          <>
            <p className="eyebrow">STEP 4</p>
            <h2 id="wizard-stage-4">ตรวจอุปกรณ์ที่มีจริง</h2>
            <div className="equipment-checklist">
              {profile.equipmentRequirements.map((item) => (
                <label key={item}>
                  <input
                    checked={Boolean(equipmentReady[item])}
                    onChange={(event) => setEquipmentReady((current) => ({ ...current, [item]: event.target.checked }))}
                    type="checkbox"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {stage === 5 && (
          <>
            <p className="eyebrow">STEP 5</p>
            <h2 id="wizard-stage-5">ตรวจสรุปและสร้าง Lot</h2>
            <dl className="wizard-review">
              <div><dt>ต้นไม้</dt><dd>{plant}</dd></div>
              <div><dt>คู่มือ</dt><dd>{template?.title}</dd></div>
              <div><dt>การฆ่าเชื้ออาหาร</dt><dd>{profile?.title}</dd></div>
              {haiterPlan && haiterPlan.state !== "blocked" && <div><dt>คำสั่งเตรียม</dt><dd>{haiterPlan.primaryInstruction}</dd></div>}
            </dl>
            <p className="wizard-guard"><strong>ยังไม่ต้องตัดต้น</strong> หลังสร้าง Lot ระบบจะเริ่มจากการเตรียมอาหารและ readiness gate</p>
          </>
        )}
      </section>

      <footer className="wizard-actions">
        <button disabled={stage === 1 || pending} onClick={() => setStage((current) => Math.max(1, current - 1))} type="button">ย้อนกลับ</button>
        {stage < 5 ? (
          <button className="primary-button" disabled={!canContinue()} onClick={() => setStage((current) => Math.min(5, current + 1))} type="button">ถัดไป</button>
        ) : (
          <button className="primary-button" disabled={pending} type="submit">{pending ? "กำลังสร้าง…" : "สร้าง Lot และเปิดคู่มือ"}</button>
        )}
      </footer>

      <button className="text-button wizard-advanced" onClick={onAdvancedMode} type="button">ใช้แบบฟอร์มขั้นสูง</button>
    </form>
  );
}
