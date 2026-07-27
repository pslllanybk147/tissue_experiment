"use client";

import { useMemo, useState, type FormEvent } from "react";

import { createHaiterActionPlan } from "../../lib/domain/haiter-guidance";
import { calculateMediumBatchPlan } from "../../lib/domain/medium-batch-calculations";
import { validateLotInput } from "../../lib/domain/experiment-validation";
import type {
  CreateLotInput,
  ProtocolTemplate,
  SterilizationProfile,
  WorkspaceApplicator,
  WorkspaceDisinfectant,
  WorkspaceType,
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
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>("still-air-box");
  const [workspaceDisinfectant, setWorkspaceDisinfectant] = useState<WorkspaceDisinfectant>("alcohol-70");
  const [workspaceApplicator, setWorkspaceApplicator] = useState<WorkspaceApplicator>("wipe");
  const [alcoholPercent, setAlcoholPercent] = useState("70");
  const [surfaceHaiterPercent, setSurfaceHaiterPercent] = useState("");
  const [surfaceTargetPercent, setSurfaceTargetPercent] = useState("");
  const [surfaceSolutionVolumeMl, setSurfaceSolutionVolumeMl] = useState("500");
  const [surfaceContactMinutes, setSurfaceContactMinutes] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
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
  const surfaceHaiterPlan = useMemo(() => {
    if (workspaceDisinfectant !== "haiter-label") return null;
    return createHaiterActionPlan({
      labelPercent: surfaceHaiterPercent.trim() ? Number(surfaceHaiterPercent) : null,
      targetPercent: Number(surfaceTargetPercent),
      mediumVolumeMl: Number(surfaceSolutionVolumeMl),
      minimumToolVolumeMl: Number(minimumMeasurableMl),
      permittedDiluent: "น้ำอุณหภูมิห้องตามฉลากผลิตภัณฑ์",
    });
  }, [
    minimumMeasurableMl,
    surfaceHaiterPercent,
    surfaceSolutionVolumeMl,
    surfaceTargetPercent,
    workspaceDisinfectant,
  ]);
  const workspaceComplete = Number(surfaceContactMinutes) > 0
    && (workspaceDisinfectant === "alcohol-70"
      ? Number(alcoholPercent) >= 70 && Number(alcoholPercent) <= 90
      : Boolean(surfaceHaiterPlan && surfaceHaiterPlan.state !== "blocked"));

  function canContinue() {
    if (stage === 1) return plant.trim().length > 0;
    if (stage === 2) return Boolean(template);
    if (stage === 3) return Boolean(mediumPlan && !mediumPlan.warnings.length) && (profile?.method === "pressure-sterilization" || haiterPlan?.state === "direct" || haiterPlan?.state === "working-dilution");
    if (stage === 4) return equipmentComplete && workspaceComplete;
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
        mediumVolumeMl: Number(mediumVolumeMl),
        minimumToolVolumeMl: Number(minimumMeasurableMl),
        calculatedDoseMl: profile.method === "haiter-chemical" && haiterPlan && haiterPlan.state !== "blocked"
          ? haiterPlan.directDoseMl
          : undefined,
        mediumBatch: mediumPlan ? {
          explantCount: Number(explantCount),
          cultureJarCount: Number(cultureJarCount),
          blankJarCount: Number(blankJarCount),
          spareJarCount: Number(spareJarCount),
          totalJarCount: mediumPlan.totalJarCount,
          mediumPerJarMl: Number(mediumPerJarMl),
          lossPercent: Number(lossPercent),
          baseVolumeMl: mediumPlan.baseVolumeMl,
          lossAllowanceMl: mediumPlan.lossAllowanceMl,
          totalVolumeMl: mediumPlan.totalVolumeMl,
        } : undefined,
        workspace: {
          workspaceType,
          disinfectant: workspaceDisinfectant,
          applicator: workspaceApplicator,
          alcoholPercent: workspaceDisinfectant === "alcohol-70" ? Number(alcoholPercent) : undefined,
          haiterSourcePercent: workspaceDisinfectant === "haiter-label" ? Number(surfaceHaiterPercent) : undefined,
          haiterTargetPercent: workspaceDisinfectant === "haiter-label" ? Number(surfaceTargetPercent) : undefined,
          solutionVolumeMl: workspaceDisinfectant === "haiter-label" ? Number(surfaceSolutionVolumeMl) : undefined,
          minimumToolVolumeMl: workspaceDisinfectant === "haiter-label" ? Number(minimumMeasurableMl) : undefined,
          calculatedHaiterMl: workspaceDisinfectant === "haiter-label" && surfaceHaiterPlan && surfaceHaiterPlan.state !== "blocked"
            ? surfaceHaiterPlan.directDoseMl
            : undefined,
          contactTimeMinutes: Number(surfaceContactMinutes),
          customEquipment: customEquipment.split(/[\n,]/).map((item) => item.trim()).filter(Boolean),
        },
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
            <label className="form-field"><span>เครื่องมือวัดของเหลวได้ต่ำสุด (mL)</span><input inputMode="decimal" onChange={(event) => setMinimumMeasurableMl(event.target.value)} value={minimumMeasurableMl} /></label>
            {profile?.method === "haiter-chemical" && (
              <div className="wizard-calculation">
                <label className="form-field"><span>ตัวเลขเปอร์เซ็นต์ที่พิมพ์อยู่บนฉลาก</span><input inputMode="decimal" onChange={(event) => setSourcePercent(event.target.value)} placeholder="เช่น 6 — ถ้าหาไม่เจอให้หยุด" value={sourcePercent} /></label>
                <label className="form-field"><span>% เป้าหมายตาม Protocol</span><input inputMode="decimal" onChange={(event) => setTargetPercent(event.target.value)} value={targetPercent} /></label>
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
            <fieldset className="workspace-planner">
              <legend>พื้นที่ปลอดเชื้อที่คุณมี</legend>
              <label className="form-field">
                <span>พื้นที่ทำงาน</span>
                <select value={workspaceType} onChange={(event) => setWorkspaceType(event.target.value as WorkspaceType)}>
                  <option value="still-air-box">Still-Air Box (SAB)</option>
                  <option value="laminar-flow-cabinet">ตู้ลมสะอาด / laminar-flow cabinet</option>
                </select>
              </label>
              <label className="form-field">
                <span>สารเช็ดพื้นผิว — เลือกเพียงชนิดเดียวต่อ session</span>
                <select value={workspaceDisinfectant} onChange={(event) => setWorkspaceDisinfectant(event.target.value as WorkspaceDisinfectant)}>
                  <option value="alcohol-70">Alcohol 70–90%</option>
                  <option value="haiter-label">Haiter/bleach เจือจางตามฉลาก</option>
                </select>
              </label>
              <label className="form-field">
                <span>วิธีนำสารลงบนพื้นผิว</span>
                <select value={workspaceApplicator} onChange={(event) => setWorkspaceApplicator(event.target.value as WorkspaceApplicator)}>
                  <option value="wipe">เทใส่ผ้าแล้วเช็ด</option>
                  <option value="spray-to-wipe">ฉีดใส่ผ้านอก SAB แล้วเช็ด — ห้ามพ่นฟุ้งในกล่อง</option>
                </select>
              </label>
              {workspaceDisinfectant === "alcohol-70" ? (
                <label className="form-field"><span>% alcohol บนฉลาก</span><input inputMode="decimal" min="70" max="90" onChange={(event) => setAlcoholPercent(event.target.value)} type="number" value={alcoholPercent} /></label>
              ) : (
                <div className="workspace-chemical-grid">
                  <label className="form-field"><span>% Haiter/NaOCl บนฉลาก</span><input inputMode="decimal" min="0" onChange={(event) => setSurfaceHaiterPercent(event.target.value)} placeholder="คัดลอกจากฉลาก" type="number" value={surfaceHaiterPercent} /></label>
                  <label className="form-field"><span>% เป้าหมายสำหรับพื้นผิวตามฉลาก</span><input inputMode="decimal" min="0" onChange={(event) => setSurfaceTargetPercent(event.target.value)} placeholder="ห้ามใช้ค่าของอาหารแทน" type="number" value={surfaceTargetPercent} /></label>
                  <label className="form-field"><span>ปริมาตรน้ำยาเช็ดที่จะเตรียม (mL)</span><input inputMode="decimal" min="1" onChange={(event) => setSurfaceSolutionVolumeMl(event.target.value)} type="number" value={surfaceSolutionVolumeMl} /></label>
                  {surfaceHaiterPlan?.state === "blocked" ? <p className="form-alert" role="alert">{surfaceHaiterPlan.reason} {surfaceHaiterPlan.safeAction}</p> : null}
                  {surfaceHaiterPlan && surfaceHaiterPlan.state !== "blocked" ? <div className="calculation-result"><strong>{surfaceHaiterPlan.primaryInstruction}</strong><ol>{surfaceHaiterPlan.actions.map((action) => <li key={action}>{action}</li>)}</ol></div> : null}
                </div>
              )}
              <label className="form-field"><span>Contact time บนฉลาก (นาที)</span><input inputMode="decimal" min="0.1" onChange={(event) => setSurfaceContactMinutes(event.target.value)} placeholder="กรอกเวลาที่พื้นผิวต้องเปียกตามฉลาก" type="number" value={surfaceContactMinutes} /></label>
              <label className="form-field"><span>อุปกรณ์อื่นที่มีจริง (คั่นด้วย comma หรือขึ้นบรรทัดใหม่)</span><textarea onChange={(event) => setCustomEquipment(event.target.value)} placeholder="เช่น ขวดสเปรย์ 500 mL, กระดาษไม่เป็นขุย, timer" rows={3} value={customEquipment} /></label>
              <p className="wizard-guard"><strong>ห้ามผสมหรือฉีดทับ:</strong> Haiter/bleach กับ alcohol กรด แอมโมเนีย หรือน้ำยาชนิดอื่น และห้ามใช้เปลวไฟใน SAB</p>
            </fieldset>
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
              <div><dt>พื้นที่ทำงาน</dt><dd>{workspaceType === "still-air-box" ? "Still-Air Box (SAB)" : "Laminar-flow cabinet"} · {workspaceDisinfectant === "alcohol-70" ? `Alcohol ${alcoholPercent}%` : `Haiter ${surfaceHaiterPercent}% → ${surfaceTargetPercent}%`} · contact time {surfaceContactMinutes} นาที</dd></div>
              {customEquipment.trim() ? <div><dt>อุปกรณ์เพิ่มเติม</dt><dd>{customEquipment}</dd></div> : null}
              {mediumPlan && <div><dt>อาหารที่ต้องเตรียม</dt><dd>{mediumPlan.totalVolumeMl} mL สำหรับ {mediumPlan.totalJarCount} กระปุก (เพาะ {cultureJarCount}, Blank {blankJarCount}, สำรอง {spareJarCount})</dd></div>}
              {profile?.method === "haiter-chemical" && <div><dt>ค่าคลอรีน</dt><dd>ฉลาก {sourcePercent}% → เป้าหมาย {targetPercent}%</dd></div>}
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
