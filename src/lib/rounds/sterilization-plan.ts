import type { LotSterilizationSnapshot, RinseWaterMethod } from "@/lib/domain/models";
import type { ExecutionInstruction, Measurement, ResolvedStep } from "@/lib/manual/types";

function cloneStep(step: ResolvedStep): ResolvedStep {
  return structuredClone(step);
}

function preparationProduct(
  snapshot: LotSterilizationSnapshot,
  part: "mediumPreparation" | "surfacePreparation",
  fallback: string,
): string {
  return snapshot[part]?.productName?.trim() || fallback;
}

function withMediumMethod(step: ResolvedStep, snapshot: LotSterilizationSnapshot): ResolvedStep {
  const method = snapshot.mediumSterilizationMethod;
  if (!method) return cloneStep(step);

  const base = cloneStep(step);
  const neutralActions = base.actions.filter((action) => !/เลือกวิธีฆ่าเชื้อ|หม้อนึ่ง|NaDCC|Haiter|NaOCl|ฆ่าเชื้ออาหารวิธี/.test(action));
  const neutralInstructions = (base.executionInstructions ?? []).filter((instruction) =>
    !/ฆ่าเชื้ออาหาร|เลือกวิธีฆ่าเชื้อ/.test(`${instruction.label} ${instruction.action}`),
  );

  if (method === "pressure-sterilization") {
    const action = "นึ่งกระปุกอาหารที่ 121°C ความดัน 15 psi นาน 15 ถึง 20 นาที โดยเริ่มจับเวลาเมื่อถึงอุณหภูมิและความดันเป้าหมาย";
    return {
      ...base,
      materials: [...base.materials, "หม้อนึ่งแรงดันหรือหม้ออัดแรงดันที่ยืนยันว่าได้ 15 psi"],
      actions: [...neutralActions, action],
      executionInstructions: [
        ...neutralInstructions,
        {
          label: "นึ่งฆ่าเชื้ออาหาร",
          action,
          materials: ["หม้อนึ่งแรงดันหรือหม้ออัดแรงดันที่ยืนยันว่าได้ 15 psi"],
          container: "หม้อนึ่งแรงดัน",
          durationLabel: "15–20 นาที",
          completion: "ครบเวลาแล้ว ปล่อยความดันลงตามคู่มือเครื่องก่อนเปิดฝา",
          next: "ปล่อยให้อาหารเย็นและเซ็ตตัวก่อนนำไปใช้",
        },
      ],
    };
  }

  if (method === "nadcc-chemical") {
    const product = preparationProduct(snapshot, "mediumPreparation", "NaDCC ตามฉลากที่ล็อกไว้กับรอบ");
    const action = "เติม NaDCC ลงในอาหารตามปริมาณที่คำนวณและยืนยันใน protocol ของรอบนี้ แล้วบันทึกปริมาณที่ใช้จริง";
    return {
      ...base,
      materials: [...base.materials, product],
      actions: [...neutralActions, action],
      executionInstructions: [
        ...neutralInstructions,
        {
          label: "ฆ่าเชื้ออาหารด้วย NaDCC",
          action,
          materials: [product, "เครื่องชั่งที่ละเอียดพอกับปริมาณที่คำนวณ"],
          completion: "ยืนยัน product/batch ปริมาณคำนวณ และปริมาณที่ใช้จริงไว้กับรอบแล้ว",
          tone: "warning",
        },
      ],
    };
  }

  const product = preparationProduct(snapshot, "mediumPreparation", "Haiter ตามฉลากที่ล็อกไว้กับรอบ");
  const action = "เติม Haiter ลงในอาหารตามปริมาณที่คำนวณและยืนยันใน protocol ของรอบนี้ แล้วบันทึกปริมาณที่ใช้จริง";
  return {
    ...base,
    materials: [...base.materials, product],
    actions: [...neutralActions, action],
    executionInstructions: [
      ...neutralInstructions,
      {
        label: "ฆ่าเชื้ออาหารด้วย Haiter",
        action,
        materials: [product, "syringe ที่ละเอียดพอกับปริมาณที่คำนวณ"],
        completion: "ยืนยัน product/batch ปริมาณคำนวณ และปริมาณที่ใช้จริงไว้กับรอบแล้ว",
        tone: "warning",
      },
    ],
  };
}

function rinseName(method: RinseWaterMethod): string {
  if (method === "nadcc") return "น้ำ NaDCC 300 ppm";
  if (method === "low-dose-hypochlorite") return "น้ำ NaOCl 300 ppm";
  if (method === "pressure-steam") return "น้ำที่ฆ่าเชื้อด้วยแรงดันไอน้ำ";
  return "น้ำปลอดเชื้อธรรมดา";
}

function rinseInstructions(method: RinseWaterMethod, volumeMl: number): ExecutionInstruction[] {
  const water = rinseName(method);
  return [1, 2, 3].map((round) => ({
    label: `ล้าง R${round}`,
    action: `ย้ายชิ้นพืชลงภาชนะ R${round} ที่มี${water} ใช้น้ำใหม่หนึ่งภาชนะต่อหนึ่งรอบ`,
    materials: [water],
    quantity: `${volumeMl} mL`,
    container: `R${round}`,
    durationMinutes: 1,
    completion: round === 3 ? "ล้างครบ 3 รอบแล้ว ไปขั้นถัดไปทันที" : `ครบ 1 นาทีแล้ว ย้ายไป R${round + 1}`,
  }));
}

function nadccSoakStep(step: ResolvedStep, snapshot: LotSterilizationSnapshot): ResolvedStep {
  const base = cloneStep(step);
  const product = preparationProduct(snapshot, "surfacePreparation", "NaDCC ตามฉลากที่ล็อกไว้กับรอบ");
  const rinseVolume = snapshot.rinseWater?.volumePerContainerMl ?? 50;
  return {
    ...base,
    summary: "แช่ชิ้นพืชด้วย NaDCC แล้วล้างออกด้วยน้ำปลอดเชื้อ",
    materials: [product, "น้ำปลอดเชื้อ", "ภาชนะแช่ S", "ภาชนะล้าง R1–R3", "ตัวจับเวลา"],
    actions: [
      "เตรียม NaDCC ให้ได้คลอรีนออกฤทธิ์ 300 ppm ตามค่าที่ล็อกไว้กับรอบ",
      "ใส่ชิ้นพืชให้จมทั้งหมดแล้วแช่ 24 ถึง 48 ชั่วโมง",
      "ครบเวลาแล้วล้างด้วยน้ำปลอดเชื้อ 3 รอบ รอบละประมาณ 1 นาที",
      "จด ppm เวลาแช่ และจำนวนรอบที่ทำจริง",
    ],
    executionInstructions: [
      {
        label: "เตรียม NaDCC ในภาชนะ S",
        action: "เตรียม NaDCC 300 ppm ตามค่าที่คำนวณจากฉลากจริงและยืนยัน product/batch ใน protocol",
        materials: [product],
        container: "S",
        completion: "สารละลายอยู่ใน S และค่าการเตรียมถูกบันทึกกับรอบ",
      },
      {
        label: "แช่ชิ้นพืชใน S",
        action: "ใส่ชิ้นพืชให้จมทั้งหมด แล้วเริ่มจับเวลาหลังใส่ชิ้นสุดท้าย",
        container: "S",
        durationLabel: "24 ถึง 48 ชั่วโมง",
        completion: "ครบเวลาที่เลือกและจดเวลาจริงแล้ว",
      },
      ...rinseInstructions("commercial-sterile", rinseVolume),
    ],
    measurements: [
      { id: "nadcc-actual-ppm", label: "NaDCC ที่ใช้จริง", unit: "ppm", kind: "number", required: true, min: 1 },
      { id: "soak-hours", label: "เวลาแช่จริง", unit: "hour", kind: "number", required: true, min: 1 },
      { id: "sterile-rinses", label: "จำนวนรอบที่ล้างจริง", unit: "count", kind: "number", required: true, min: 1 },
    ],
    safetyNotes: ["สวมถุงมือและแว่นตา", "ห้ามผสม NaDCC กับกรด แอมโมเนีย หรือแอลกอฮอล์"],
    troubleshootingIds: base.troubleshootingIds?.filter((id) => id !== "browning-bleach-damage"),
    doses: undefined,
    durationMinutes: 2880,
  };
}

function isRinseContent(value: string): boolean {
  return /ล้างรอบ|ล้าง R\d|R1|R2|R3|R4|final rinse|300\s*ppm|ทางเลือกทดลอง/.test(value);
}

function withHaiterAndRinse(step: ResolvedStep, snapshot: LotSterilizationSnapshot): ResolvedStep {
  const rinseMethod = snapshot.rinseMethod;
  if (!rinseMethod) return cloneStep(step);

  const base = cloneStep(step);
  const product = preparationProduct(snapshot, "surfacePreparation", "Haiter ตามฉลากที่ล็อกไว้กับรอบ");
  const surfaceActions = base.actions.filter((action) =>
    !isRinseContent(action) && !/NaDCC|น้ำปลอดเชื้อ|น้ำ rinse|ล้าง/.test(action),
  );
  const surfaceInstructions = (base.executionInstructions ?? [])
    .filter((instruction) => !isRinseContent(`${instruction.label} ${instruction.action} ${instruction.quantity ?? ""}`))
    .map((instruction) => ({
      ...instruction,
      ...(instruction.materials
        ? { materials: instruction.materials.filter((material) => !/น้ำปลอดเชื้อ|NaDCC|NaOCl|rinse/i.test(material)) }
        : {}),
    }));
  const volumeMl = snapshot.rinseWater?.volumePerContainerMl ?? 50;
  const selectedRinseInstructions = rinseInstructions(rinseMethod, volumeMl);
  const selectedRinseName = rinseName(rinseMethod);
  const measurements: Measurement[] = base.measurements.filter((measurement) =>
    !/rinse|nadcc/i.test(`${measurement.id} ${measurement.label}`),
  );
  if (rinseMethod === "nadcc" || rinseMethod === "low-dose-hypochlorite") {
    measurements.push({ id: "rinse-actual-ppm", label: `ppm ที่ใช้จริงของ${selectedRinseName}`, unit: "ppm", kind: "number", required: true, min: 1 });
  }

  return {
    ...base,
    materials: [product, "ภาชนะแช่ S", "ตัวจับเวลา", selectedRinseName, "ภาชนะล้าง R1–R3"],
    actions: [...surfaceActions, `ครบเวลาฟอกแล้วล้างด้วย${selectedRinseName} 3 รอบ รอบละประมาณ 1 นาที`],
    executionInstructions: [...surfaceInstructions, ...selectedRinseInstructions],
    measurements,
    safetyNotes: base.safetyNotes.filter((note) => !/NaDCC/.test(note)),
  };
}

export function resolveSterilizationStep(
  step: ResolvedStep,
  snapshot?: LotSterilizationSnapshot,
): ResolvedStep {
  if (!snapshot || (step.id !== "prep-media" && step.id !== "sterilize")) return cloneStep(step);
  if (step.id === "prep-media") return withMediumMethod(step, snapshot);
  if (snapshot.method === "nadcc-soak") return nadccSoakStep(step, snapshot);
  return withHaiterAndRinse(step, snapshot);
}
