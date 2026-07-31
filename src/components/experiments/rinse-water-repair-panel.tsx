"use client";

import { useMemo, useState, type FormEvent } from "react";

import { calculateHaiterDose } from "../../lib/domain/haiter-calculations";
import type { ExperimentLot, RinseWaterSnapshot } from "../../lib/domain/models";
import {
  buildLowDoseRinseWaterSnapshot,
  LOW_DOSE_RINSE_TARGET_PERCENT,
  rinseWaterTotalMl,
} from "../../lib/domain/rinse-water-planning";

type Props = {
  lot: ExperimentLot;
  onSave: (rinseWater: RinseWaterSnapshot) => Promise<void>;
};

export function RinseWaterRepairPanel({ lot, onSave }: Props) {
  const [volumePerContainerMl, setVolumePerContainerMl] = useState("50");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const sourcePercent = lot.sterilization?.activeChlorinePercent ?? 0;
  const minimumMeasurableMl = lot.sterilization?.minimumToolVolumeMl ?? 0.1;
  const dose = useMemo(() => {
    if (sourcePercent <= 0) return null;
    try {
      return calculateHaiterDose({
        sourcePercent,
        targetPercent: LOW_DOSE_RINSE_TARGET_PERCENT,
        finalVolumeMl: 1000,
        minimumMeasurableMl,
      });
    } catch {
      return null;
    }
  }, [minimumMeasurableMl, sourcePercent]);

  if (
    lot.workflowVersion !== "v2"
    || lot.sterilization?.method !== "haiter-chemical"
    || lot.sterilization.rinseWater
  ) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!dose) {
      setError("Lot นี้ไม่มีเปอร์เซ็นต์ Haiter จากฉลาก จึงยังคำนวณน้ำล้างไม่ได้");
      return;
    }
    setPending(true);
    try {
      await onSave(buildLowDoseRinseWaterSnapshot(Number(volumePerContainerMl)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกวิธีน้ำล้างไม่สำเร็จ");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="experiment-surface migration-state" onSubmit={submit}>
      <p className="eyebrow">ข้อมูลที่เพิ่มภายหลัง</p>
      <h2>Lot นี้ยังไม่ได้บันทึกวิธีเตรียมน้ำล้าง</h2>
      <p>Lot นี้สร้างก่อนระบบเพิ่มข้อมูลน้ำล้าง จึงยังแสดงคำสั่ง 0.003% ในขั้นฟอกไม่ได้ บันทึกเพิ่มได้โดยไม่ต้องสร้าง Lot ใหม่และไม่ต้องทำขั้นเดิมซ้ำ</p>
      <div className="calculation-result">
        <strong>น้ำล้างแบบไม่ใช้หม้อนึ่ง: active chlorine {LOW_DOSE_RINSE_TARGET_PERCENT}%</strong>
        {dose ? (
          <p>
            Haiter จากฉลาก {sourcePercent}%: ตวง {dose.sourceVolumeMl.toFixed(3)} mL แล้วเติมน้ำให้ครบ 1,000 mL พัก 60 นาที
          </p>
        ) : (
          <p className="form-alert">Lot ไม่มีเปอร์เซ็นต์จากฉลาก Haiter จึงห้ามเดาปริมาตร</p>
        )}
      </div>
      <label className="form-field">
        <span>น้ำล้างต่อภาชนะ (mL)</span>
        <input min="1" onChange={(event) => setVolumePerContainerMl(event.target.value)} required type="number" value={volumePerContainerMl} />
        <small>ระบบเตรียม 3 ภาชนะ รวม {rinseWaterTotalMl(Number(volumePerContainerMl) || 0)} mL</small>
      </label>
      {error ? <p className="form-alert" role="alert">{error}</p> : null}
      <button className="primary-button" disabled={pending || !dose} type="submit">
        {pending ? "กำลังบันทึก…" : "บันทึกวิธีน้ำล้างให้ Lot นี้"}
      </button>
    </form>
  );
}
