import type {
  BeginnerInstruction,
  BeginnerMaterial,
  EvidenceState,
  ExperimentLot,
  ProtocolStep,
  StepMeasurement,
} from "./models";
import { calculateHaiterDose, planHaiterWorkingDilution } from "./haiter-calculations";
import { minimumPressureSteamMinutes, rinseWaterTotalMl } from "./rinse-water-planning";
import {
  beginnerInstructionIssues,
  beginnerMaterialSemanticIssues,
  createBeginnerInstruction,
} from "./zero-knowledge-protocol";

const vaguePatterns = [
  /ตามคำแนะนำ/i,
  /ตาม protocol/i,
  /ตามวิธีของห้อง/i,
  /ตามจังหวะ/i,
  /พอประมาณ/i,
  /สักครู่/i,
];

export function containsVagueInstruction(text: string): boolean {
  return vaguePatterns.some((pattern) => pattern.test(text));
}

export function guidedProtocolV2SemanticIssues(steps: ProtocolStep[]): string[] {
  return steps.flatMap((protocolStep) => {
    if (!protocolStep.beginner) return [`${protocolStep.id}: ไม่มีคู่มือสำหรับมือใหม่`];
    const structural = beginnerInstructionIssues(protocolStep.beginner);
    const materials = protocolStep.beginner.materials.flatMap(beginnerMaterialSemanticIssues);
    const vague = [protocolStep.instruction, ...protocolStep.beginner.actions]
      .filter(containsVagueInstruction)
      .map((value) => `มีคำสั่งคลุมเครือ: ${value}`);
    return [...structural, ...materials, ...vague].map((issue) => `${protocolStep.id}: ${issue}`);
  });
}

export function canRunGuidedProtocolV2(lot: ExperimentLot): boolean {
  return lot.workflowVersion === "v2"
    && lot.taxonId === "cultivar-pink-princess"
    && lot.sterilization?.method === "haiter-chemical";
}

type StepInput = {
  id: string;
  title: string;
  objective: string;
  actions: string[];
  materials: Array<string | BeginnerMaterial>;
  checks: string[];
  stop: string[];
  evidenceState?: EvidenceState;
  referenceIds?: string[];
  durationMinutes?: number | null;
  measurements?: StepMeasurement[];
};

function step(order: number, input: StepInput): ProtocolStep {
  const materialDetails = input.materials.map((item) => (
    typeof item === "string" ? (() => { throw new Error(`Material was not enriched: ${item}`); })() : item
  ));
  const beginner: BeginnerInstruction = createBeginnerInstruction({
    currentAction: input.objective,
    actions: input.actions,
    materials: materialDetails,
    whatToFind: input.checks,
    stopConditions: input.stop,
    evidencePrompt: ["บันทึกเฉพาะค่าที่ระบบถามในขั้นนี้"],
    readyChecklist: input.checks,
    scienceNote: input.objective,
  });
  return {
    id: `v2-${input.id}`,
    order,
    title: input.title,
    instruction: input.actions.join(" "),
    durationMinutes: input.durationMinutes ?? null,
    criticalControls: input.stop,
    safetyNotes: [],
    referenceIds: input.referenceIds ?? [],
    evidenceState: input.evidenceState ?? "Adapted",
    objective: input.objective,
    whyItMatters: input.objective,
    materials: materialDetails.map((item) => item.name),
    measurements: input.measurements,
    expectedResult: input.checks.join(" "),
    passCriteria: input.checks,
    failCriteria: input.stop,
    nextActionOnPass: "เปิดขั้นถัดไป",
    nextActionOnFail: "หยุดขั้นนี้ แก้รายการที่ระบบแสดง แล้วเริ่มขั้นนี้ใหม่",
    requiredEvidence: input.measurements?.some((item) => item.required)
      ? ["measurement"]
      : [],
    allowPhoto: false,
    allowNote: true,
    beginner,
  };
}

function jarSummary(lot: ExperimentLot): string {
  const batch = lot.sterilization?.mediumBatch;
  if (!batch) return "ใช้จำนวนกระปุกที่บันทึกไว้ใน Lot นี้";
  return `${batch.totalJarCount} กระปุก: เพาะ ${batch.cultureJarCount}, Blank ${batch.blankJarCount}, สำรอง ${batch.spareJarCount}`;
}

function material(
  name: string,
  appearance: string,
  purpose: string,
  quantity: string,
  specification: string,
  allowedSubstitutes: string[] = [],
): BeginnerMaterial {
  return { name, appearance, purpose, quantity, specification, allowedSubstitutes };
}

function sterileRinsePreparationActions(lot: ExperimentLot): string[] {
  const plan = lot.sterilization?.rinseWater;
  if (!plan) {
    return [
      "หยุดขั้นนี้: Lot ยังไม่ได้บันทึกแหล่งน้ำล้างปลอดเชื้อ ห้ามใช้น้ำกลั่นจากร้านหรือน้ำต้มแทนโดยเดาเอง",
    ];
  }
  const each = plan.volumePerContainerMl;
  if (plan.method === "low-dose-hypochlorite") {
    const preparationVolume = plan.preparationVolumeMl ?? 1000;
    const target = plan.targetChlorinePercent ?? 0.003;
    const source = lot.sterilization?.activeChlorinePercent ?? 0;
    const minimum = lot.sterilization?.minimumToolVolumeMl ?? 0.1;
    if (source <= 0) {
      return ["หยุดขั้นนี้: อ่านเปอร์เซ็นต์ active chlorine หรือ sodium hypochlorite จากฉลาก Haiter แล้วบันทึกใน Lot ก่อน"];
    }
    const dose = calculateHaiterDose({
      sourcePercent: source,
      targetPercent: target,
      finalVolumeMl: preparationVolume,
      minimumMeasurableMl: minimum,
    });
    if (dose.needsWorkingDilution) {
      return [
        `หยุดขั้นนี้: ปริมาตร Haiter ${dose.sourceVolumeMl.toFixed(3)} mL ต่ำกว่าที่อุปกรณ์ตวงได้ ${minimum} mL`,
        "เปิดเครื่องคำนวณ working dilution ของ Lot แล้วทำสารเจือจางก่อน ห้ามกะด้วยหยด",
      ];
    }
    return [
      `เตรียมน้ำสะอาด ${preparationVolume.toLocaleString("th-TH")} mL ในภาชนะสะอาดที่มีฝาปิด`,
      `ตวง Haiter จากขวด ${dose.sourceVolumeMl.toFixed(3)} mL เติมลงในน้ำ เพื่อให้ได้ active chlorine ${target}%`,
      "ปิดฝาแล้วกลับภาชนะขึ้นลงช้า ๆ 10 รอบให้ผสมทั่ว ห้ามเขย่าจนเกิดฟองมาก",
      `พักภาชนะปิดไว้อย่างน้อย ${plan.minimumWaitMinutes ?? 60} นาที`,
      "เตรียม 3 ภาชนะปลอดเชื้อ แล้วติดป้ายว่า น้ำล้าง 1, น้ำล้าง 2 และน้ำล้าง 3",
      `แบ่งน้ำภาชนะละ ${each} mL รวม ${rinseWaterTotalMl(each)} mL แล้วปิดฝาทันที`,
      "ใช้ภายในรอบงานนี้และไม่เทน้ำที่ใช้แล้วกลับภาชนะเดิม",
    ];
  }
  if (plan.method === "commercial-sterile") {
    return [
      "ตรวจฉลากภาชนะเดิม ต้องมีคำว่า sterile water และระบุว่าเหมาะกับงาน cell culture หรือ tissue culture",
      `ตรวจว่ามีน้ำสำหรับล้างอย่างน้อย ${rinseWaterTotalMl(each)} mL โดยภาชนะเดิมยังไม่ถูกเปิดและยังไม่หมดอายุ`,
      "เตรียมภาชนะปลอดเชื้อ 3 ใบ ติดป้าย น้ำล้าง 1, น้ำล้าง 2 และน้ำล้าง 3",
      `เมื่อ SAB พร้อมแล้วจึงเปิดน้ำ และแบ่งภาชนะละ ${each} mL จากนั้นปิดฝาทันที`,
      "ห้ามเติม Haiter ลงในน้ำล้างทั้งสามภาชนะ",
    ];
  }
  const minutes = minimumPressureSteamMinutes(each);
  return [
    "ใช้น้ำกลั่นหรือน้ำ DI; น้ำกลั่นที่ยังไม่ผ่านขั้นตอนนี้ยังไม่ถือว่าปลอดเชื้อ",
    "เตรียมภาชนะทนแรงดัน 3 ใบ ติดป้าย น้ำล้าง 1, น้ำล้าง 2 และน้ำล้าง 3",
    `เติมน้ำภาชนะละ ${each} mL รวม ${rinseWaterTotalMl(each)} mL แล้วคลายฝาแต่ละใบครึ่งรอบ ห้ามปิดแน่นก่อนนึ่ง`,
    `ใช้ liquid cycle ที่ตรวจยืนยันว่าได้ 121°C และ 15 psi อย่างน้อย ${minutes} นาทีสำหรับปริมาตร ${each} mL ต่อภาชนะ`,
    "ปล่อยให้เย็นถึงอุณหภูมิห้องโดยไม่เปิดฝา แล้วปิดฝาให้แน่นก่อนย้ายออกจากเครื่อง",
    "เก็บภาชนะปิดไว้จน SAB พร้อม ห้ามเติม Haiter ลงในน้ำล้าง",
  ];
}

function guidedMaterial(name: string, lot: ExperimentLot): BeginnerMaterial {
  const batch = lot.sterilization?.mediumBatch;
  const totalJars = batch?.totalJarCount ?? 0;
  const cultureJars = batch?.cultureJarCount ?? 0;
  const blankJars = batch?.blankJarCount ?? 0;
  const spareJars = batch?.spareJarCount ?? 0;
  const volume = lot.sterilization?.mediumVolumeMl ?? 0;
  const source = lot.sterilization?.activeChlorinePercent ?? 0;
  const common: Record<string, BeginnerMaterial> = {
    "ต้นแม่": material("ต้นแม่", "ต้น Pink Princess ที่มีรหัสตรงกับ Plant Record และ Lot นี้", "ตรวจสุขภาพ หา node และตัด explant จากต้นเดียวกับที่บันทึก", "1 ต้น", "รหัสต้นต้องตรงกับ Lot และต้องยังไม่พบเน่าหรือแมลง", []),
    "แว่นขยาย": material("แว่นขยาย", "เลนส์ขยายที่ทำให้เห็นตาข้างและแมลงจุดเล็กได้ชัด", "ตรวจตาข้าง แมลง และรอยโรคโดยไม่เดาจากสายตา", "1 อัน", "ภาพชัด มีแสงพอ และไม่บิดเบี้ยว", ["กล้องโทรศัพท์ที่ซูมและโฟกัสตาข้างได้ชัด"]),
    "ไม้บรรทัด": material("ไม้บรรทัด", "ไม้บรรทัดที่มีขีดมิลลิเมตรและเซนติเมตรอ่านชัด", "วัดระยะเหนือและใต้ node ก่อนตัด", "1 อัน", "อ่านได้อย่างน้อยถึง 1 mm และเช็ดพื้นผิวได้", []),
    "ป้ายรหัส Lot": material("ป้ายรหัส Lot", "ป้ายหรือเทปที่เขียนรหัส Lot แล้วไม่เลือนเมื่อเปียก", "ป้องกันการสลับต้นและวัสดุ", "1 ป้ายสำหรับต้นแม่", "ต้องอ่านรหัส Lot ได้ครบ", ["เทปเขียนฉลากชนิดทนน้ำ"]),
    "ป้ายหมายเลขข้อ": material("ป้ายหมายเลขข้อ", "ป้ายเล็กที่เขียนเลข node และติดใกล้ตำแหน่งโดยไม่บังตาข้าง", "จำตำแหน่ง node ที่เลือกก่อนตัด", "อย่างน้อย 1 ป้ายต่อ node ที่เลือก", "ทนน้ำ อ่านเลขได้ และไม่รัดลำต้น", ["เชือกสีอ่อนพร้อมป้ายทนน้ำ"]),
    "รายการ batch ของ Lot": material("รายการ batch ของ Lot", "กล่องสรุปบนหน้าจอที่แสดงจำนวน explant กระปุกแต่ละชนิด และปริมาตรอาหาร", "ใช้ตรวจจำนวนจริงก่อนติดฉลาก", "1 รายการของ Lot นี้", `ต้องแสดงปริมาตร ${volume} mL และจำนวนรวม ${totalJars || "ที่บันทึกไว้"} กระปุก`, []),
    "ป้ายรหัสกระปุก": material("ป้ายรหัสกระปุก", "เทปหรือป้ายทนน้ำที่เขียน Lot ชนิดกระปุก และเลขลำดับ", "แยกกระปุกเพาะ Blank และสำรอง", `อย่างน้อย ${totalJars || "หนึ่งป้ายต่อกระปุก"} ป้าย`, "หนึ่งป้ายต่อหนึ่งกระปุกและอ่านได้หลังเปียก", []),
    "กระปุกเพาะ Blank และสำรอง": material("กระปุกเพาะ Blank และสำรอง", "กระปุกใสไม่มีรอยแตก ฝาปิดสนิท และแยกป้าย เพาะ, Blank, สำรอง", "กำหนดจำนวนภาชนะจริงก่อนคำนวณอาหาร", `รวม ${totalJars || "ตามรายการ Lot"} กระปุก: เพาะ ${cultureJars}, Blank ${blankJars}, สำรอง ${spareJars}`, `แต่ละกระปุกรองรับอาหาร ${batch?.mediumPerJarMl ?? "ตามรายการ"} mL และปิดฝาได้สนิท`, []),
    "น้ำปลอดเชื้อ": (() => {
      const rinse = lot.sterilization?.rinseWater;
      const each = rinse?.volumePerContainerMl ?? 0;
      const sourceDescription = rinse?.method === "low-dose-hypochlorite"
        ? `น้ำสะอาดที่เติม Haiter ให้ได้ active chlorine ${rinse.targetChlorinePercent ?? 0.003}% และพัก ${rinse.minimumWaitMinutes ?? 60} นาที`
        : rinse?.method === "commercial-sterile"
        ? "น้ำปลอดเชื้อในภาชนะเดิมที่ยังไม่เปิด ฉลากระบุ sterile water สำหรับ cell/tissue culture"
        : rinse?.method === "pressure-steam"
          ? "น้ำกลั่นหรือน้ำ DI แบ่งในภาชนะทนแรงดัน แล้วผ่าน liquid cycle ที่ยืนยันได้"
          : "Lot นี้ยังไม่บันทึกแหล่งน้ำล้างปลอดเชื้อ";
      return material(
        "น้ำล้างปลอดเชื้อและภาชนะน้ำล้าง",
        sourceDescription,
        "ล้างสารฟอกออกจาก explant สามรอบโดยไม่ใช้น้ำเดิมซ้ำ",
        rinse ? `3 ภาชนะ ภาชนะละ ${each} mL รวม ${rinseWaterTotalMl(each)} mL` : "ยังคำนวณไม่ได้จนกว่าจะเลือกแหล่งน้ำล้าง",
        rinse?.method === "low-dose-hypochlorite"
          ? `ติดป้าย น้ำล้าง 1, 2 และ 3; active chlorine ${rinse.targetChlorinePercent ?? 0.003}% และน้ำต้องท่วม explant`
          : "ติดป้าย น้ำล้าง 1, 2 และ 3; น้ำต้องมากพอให้ explant ทุกชิ้นจม",
        [],
      );
    })(),
    "Haiter ที่ฉลากอ่านเปอร์เซ็นต์ได้": material("Haiter ที่ฉลากอ่านเปอร์เซ็นต์ได้", `ขวดเดิมที่ฉลากอ่าน sodium hypochlorite หรือ active chlorine ${source}% ได้`, "เตรียมสารฆ่าเชื้ออาหารและสารฟอกผิวตามตัวเลขของ Lot", "1 ขวดเดิมที่ยังไม่หมดอายุ", `ฉลากต้องอ่าน ${source}% ได้และต้องไม่ผสมน้ำหอมหรือสารทำความสะอาดอื่น`, []),
    "สารละลายฮอร์โมนที่มีฉลาก": material("สารละลายฮอร์โมนที่มีฉลาก", "ขวดแยก BAP และ NAA ที่ระบุชื่อ ความเข้มข้น หน่วย วันที่ และตัวทำละลาย", "ใช้คำนวณปริมาตรฮอร์โมนสำหรับอาหาร", "BAP 1 ขวด และ NAA 1 ขวด", "ฉลากต้องมีชื่อ ความเข้มข้น mg/mL หน่วย และวันที่เตรียมครบ", []),
    "อุปกรณ์ตวง": material("อุปกรณ์ตวง", "ปิเปตหรือกระบอกตวงที่มีสเกล mL และอ่านค่าต่ำสุดได้", "ตวง Haiter น้ำ และ stock ตามตัวเลขบนหน้าจอ", "อย่างน้อย 1 ชุดที่ครอบคลุมทุกปริมาตร", `ค่าต่ำสุดต้องไม่มากกว่า ${lot.sterilization?.minimumToolVolumeMl ?? 0.1} mL; ถ้าตวงต่ำกว่านี้ให้ใช้ working dilution ที่ระบบคำนวณ`, []),
    "กระปุกและฝา": material("กระปุกเพาะและฝา", "กระปุกใสไม่มีรอยแตก ฝาปิดสนิท และติดป้ายได้", "บรรจุอาหาร แยก Blank และเพาะ explant", `รวม ${totalJars || "ตามรายการ Lot"} กระปุก: เพาะ ${cultureJars}, Blank ${blankJars}, สำรอง ${spareJars}`, `แต่ละกระปุกรองรับอาหาร ${batch?.mediumPerJarMl ?? "ตามรายการ"} mL และฝาไม่รั่ว`, []),
    "Haiter": material("Haiter", `ขวดเดิมที่อ่าน active chlorine ${source}% ได้`, "เตรียมสารฆ่าเชื้อตามตัวเลขของขั้นนี้", "1 ขวด", "ไม่มีกลิ่นหรือสารเติมแต่งที่สูตรไม่อนุญาต และยังไม่หมดอายุ", []),
    "น้ำกลั่น": material("น้ำกลั่น", "น้ำใสในขวดปิดที่ฉลากระบุน้ำกลั่น", "เจือจาง Haiter สำหรับล้างกระปุกและฝา", "อย่างน้อย 95 mL สำหรับสาร 100 mL และมีสำรองสำหรับการตวง", "ไม่มีตะกอนและไม่ใช้แทนน้ำล้างปลอดเชื้อของ explant", []),
    "ถาดพัก": material("ถาดพัก", "ถาดผิวเรียบ ขนาดวางกระปุกและฝาทั้งหมดได้โดยไม่ซ้อนกัน", "พักกระปุกหลังสารสัมผัสครบทุกด้าน", "1 ถาด", `วางกระปุก ${totalJars || "ทั้งหมด"} ใบได้โดยไม่ซ้อนและเช็ดทำความสะอาดได้`, []),
    "ตัวจับเวลา": material("ตัวจับเวลา", "นาฬิกาหรือโทรศัพท์ที่ตั้งนับถอยหลังและมีเสียงเตือนได้", "จับเวลาสัมผัสสารและเวลารอให้ครบ ไม่กะด้วยความรู้สึก", "1 เครื่อง", "ตั้งได้เป็นนาทีและชั่วโมงโดยไม่ดับระหว่างทำงาน", ["ตัวจับเวลาของระบบ"]),
    "MS basal salts": material("MS basal salts", "ผลิตภัณฑ์ที่ฉลากระบุ MS basal salts และอัตราสำหรับ 1 L", "ให้ธาตุอาหารแก่ explant", `ปริมาณสำหรับอาหาร ${volume} mL ตามฉลากและกล่องสูตรของ Lot`, "ชื่อสูตรต้องตรงกับกล่องสูตร ห้ามใช้ปุ๋ยต้นไม้แทน", []),
    "sucrose": material("sucrose", "ผลึกสีขาวที่ภาชนะระบุ sucrose", "เป็นแหล่งพลังงานในอาหารเพาะ", `${(volume * 0.03).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} g`, "ชั่งด้วยเครื่องชั่ง ไม่ใช้ช้อนกะ", []),
    "agar": material("agar", "ผงวุ้นที่ฉลากระบุ agar และความแรงเจล", "ทำให้อาหารแข็งพอรองรับ explant", `${(volume * 0.0075).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")} g`, "ใช้ชนิดและอัตราเดียวกับสูตร Lot", []),
    "สารละลายฮอร์โมน": material("สารละลายฮอร์โมน BAP และ NAA", "ขวด BAP และ NAA แยกกันพร้อมฉลากความเข้มข้น mg/mL", "เติมฮอร์โมนให้ได้ BAP 0.5 mg/L และ NAA 0.05 mg/L", "ตวงตามผลคำนวณ working stock บนหน้าจอของ Lot", "ถ้าปริมาตรต่ำกว่าค่าต่ำสุดของอุปกรณ์ ต้องทำ working dilution ก่อน", []),
    "เครื่องชั่ง": material("เครื่องชั่ง", "เครื่องชั่งดิจิทัลที่แสดงกรัมและค่าความละเอียด", "ชั่ง MS sucrose และ agar", "1 เครื่อง", "ความละเอียดต้องเพียงพอกับค่าน้อยที่สุดที่ต้องชั่ง และตั้งศูนย์พร้อมภาชนะได้", []),
    "เครื่องวัด pH": material("เครื่องวัด pH", "เครื่องที่แสดงค่า pH เป็นตัวเลขและมีสารสอบเทียบ", "ปรับอาหารให้อยู่ในช่วง 5.7–5.8", "1 เครื่อง", "สอบเทียบก่อนใช้และอ่านละเอียดอย่างน้อย 0.1 pH", ["แถบ pH ช่วงแคบ 5–7 เมื่อ Protocol version อนุญาต"]),
    "เตาและแท่งแก้ว": material("เตาให้ความร้อนและแท่งคน", "เตาที่ปรับความร้อนได้และแท่งแก้วสะอาดยาวพ้นปากภาชนะ", "ให้ agar ละลายโดยคนต่อเนื่อง", "เตา 1 เครื่อง และแท่งคน 1 แท่ง", `ภาชนะให้ความร้อนต้องจุเกิน ${volume} mL และทนความร้อน`, []),
    "อาหารที่อุณหภูมิ 55–60°C": material("อาหารที่อุณหภูมิ 55–60°C", "อาหารที่ผสมครบและวัดอุณหภูมิได้ 55–60°C", "รับ Haiter โดยไม่ร้อนเกินเงื่อนไขทดลอง", `${volume} mL`, "ต้องวัดด้วยเทอร์โมมิเตอร์ ไม่ใช้มือแตะหรือกะ", []),
    "ถุงมือ": material("ถุงมือใช้ครั้งเดียว", "ถุงมือพอดีมือ ไม่มีรูหรือรอยขาด", "ลดการสัมผัสสารและสิ่งสกปรกจากมือ", "1 คู่ต่อรอบงาน และเปลี่ยนเมื่อขาดหรือเปื้อน", "พอดีมือและทนสารที่ใช้", []),
    "แว่นตา": material("แว่นตานิรภัย", "แว่นที่บังด้านหน้าและด้านข้างดวงตา", "ป้องกัน Haiter กระเด็นเข้าตา", "1 อัน", "ไม่แตกร้าวและมองเห็นสเกลตวงได้ชัด", []),
    "กระปุก Blank ที่ปิดฝา": material("กระปุก Blank ที่ปิดฝา", "กระปุกอาหารไม่มี explant ปิดฝาและติดคำว่า Blank", "ตรวจการปนเปื้อนจากอาหารและภาชนะก่อนตัดต้น", `${blankJars || 1} กระปุก`, "ฝาปิดสนิท รหัสตรงกับ Lot และห้ามเปิดระหว่างรอ", []),
    "ตัวจับเวลาของระบบ": material("ตัวจับเวลาของระบบ", "ปุ่มจับเวลา 48 ชั่วโมงในขั้นนี้", "บันทึกเวลาเริ่มและครบกำหนดโดยไม่เริ่มนับใหม่เมื่อเปิดหน้า", "1 ตัวจับเวลาของ Lot", "ใช้เวลาเดิมได้หากเริ่มรอไปแล้ว หรือบันทึกเวลาจริงย้อนหลัง", []),
    "น้ำสะอาด": material("น้ำสะอาด", "น้ำไหลใส ไม่มีตะกอนและไม่มีกลิ่นผิดปกติ", "ล้างดินและเศษอินทรีย์จากภายนอกต้นก่อนเข้า SAB", "น้ำไหลต่อเนื่องจนไม่เห็นดินติดบริเวณ node", "ใช้เฉพาะล้างภายนอกต้น ไม่ใช่น้ำล้างหลังฟอก", []),
    "ภาชนะล้าง": material("ถาดล้างต้นแม่", "ถาดสะอาดที่รองยอดและน้ำล้างได้โดยไม่แตะพื้นหรืออ่างโดยตรง", "รองต้นระหว่างล้างภายนอกก่อนเข้า SAB", "1 ถาด", "ใหญ่พอรองส่วนยอดและ node ที่เลือกโดยไม่พับหรือกดตาข้าง", []),
    "ป้ายรหัส": material("ป้ายรหัส", "ป้ายทนน้ำที่อ่านรหัส Lot ได้", "ป้องกันการสลับต้นระหว่างล้าง", "1 ป้ายติดกับถาดล้าง", "อ่านรหัสได้หลังเปียก", []),
    "Still-Air Box": material("Still-Air Box (SAB)", "กล่องใสมีช่องสอดมือ ผิวด้านในเรียบและปิดด้านบนทุกด้าน", "ลดอากาศเคลื่อนและฝุ่นตกบนเครื่องมือหรือ explant", "1 กล่อง", "วางอุปกรณ์ทั้งหมดได้โดยมือไม่ชนผนัง และไม่มีพัดลมในกล่อง", []),
    "สารเช็ดพื้นผิวที่ Lot บันทึก": material("สารเช็ดพื้นผิว", "ขวดฉลากชัดตรงกับชนิดและความเข้มข้นที่บันทึกใน Lot", "เช็ดคราบบนโต๊ะ SAB และด้านนอกอุปกรณ์", "ปริมาณพอให้ผิวเปียกทั่วโดยไม่เกิดแอ่ง", "ห้ามฉีดพ่นเป็นละอองใน SAB ขณะมีเปลวไฟ และห้ามผสม Haiter กับกรด แอมโมเนีย หรือแอลกอฮอล์", []),
    "คีม": material("คีมปลายเรียว", "คีมโลหะปลายตรง จับ explant ได้โดยไม่ลื่น", "ย้าย explant ระหว่างสารฟอก น้ำล้าง และอาหาร", "อย่างน้อย 1 อัน", "ปลายประกบสนิท ไม่มีสนิม และผ่านวิธีทำให้ปลอดเชื้อของ Lot", []),
    "มีด": material("มีดผ่าตัดหรือใบมีด", "ใบมีดคม ไม่มีสนิม และติดด้ามแน่น", "ตัด explant ให้แผลเรียบและไม่ช้ำ", "อย่างน้อย 1 ใบ พร้อมใบสำรอง 1 ใบ", "ผ่านวิธีทำให้ปลอดเชื้อของ Lot และไม่ใช้ใบมีดทื่อ", []),
    "มีดหรือกรรไกรสะอาด": material("มีดหรือกรรไกรสะอาด", "คม ไม่มีสนิม และจับได้มั่นคง", "ตัดชิ้นจากต้นแม่ตามระยะที่วัด", "1 ชิ้น", "เช็ดทำความสะอาดและแห้งก่อนตัด", ["มีดผ่าตัดที่สะอาด"]),
    "ภาชนะติดรหัส": material("ภาชนะรับ explant", "ภาชนะสะอาดมีฝาปิดและป้ายรหัส Lot", "รับชิ้นที่ตัดจากต้นแม่ก่อนเริ่มฟอก", `1 ภาชนะสำหรับ explant ${batch?.explantCount ?? 1} ชิ้น`, "จุชิ้นทั้งหมดได้โดยไม่งอหรือกดตาข้าง", []),
    "สารละลาย active chlorine 0.6%": material("สารฟอกผิว active chlorine 0.6%", "สารใสในภาชนะปิดที่ติดฉลาก 0.6% พร้อมวันและเวลา", "ลดเชื้อบนผิว explant เป็นเวลา 8 นาที", "100 mL เตรียมใหม่สำหรับรอบนี้", `เตรียมจาก Haiter ${source}% ตามตัวเลขที่ขั้นนี้คำนวณ ห้ามใช้เมื่อฉลากไม่ครบ`, []),
    "น้ำล้างปลอดเชื้อ 1–3": material("น้ำล้างปลอดเชื้อ 1–3", "ภาชนะมีฝาปิด 3 ใบ ติดป้าย น้ำล้าง 1, 2 และ 3", "ล้างสารฟอกออกสามรอบโดยไม่ใช้น้ำซ้ำ", "3 ภาชนะ แยกหนึ่งภาชนะต่อหนึ่งรอบล้าง", "แต่ละใบมีน้ำปลอดเชื้อมากพอให้ explant ทุกชิ้นจมทั้งหมด", []),
    "SAB ที่เตรียมแล้ว": material("SAB ที่เตรียมแล้ว", "SAB ที่เช็ดแล้ว ปิดไว้ครบ 15 นาที และไม่มีแอ่งสาร", "เป็นพื้นที่เปิดกระปุกและตัดแต่ง explant", "1 กล่อง", "อากาศนิ่ง อุปกรณ์ครบ และแยกด้านสะอาดจากของใช้แล้ว", []),
    "มีดและคีม": material("มีดและคีมปลอดเชื้อ", "มีดคมและคีมปลายประกบที่ผ่านวิธีทำให้ปลอดเชื้อของ Lot", "ตัดแผลภายนอกและวาง explant ลงอาหาร", "มีดอย่างน้อย 1 ใบและคีม 1 อัน", "ไม่มีสนิม ไม่สัมผัสพื้นหรือผนัง SAB หลังทำให้ปลอดเชื้อ", []),
    "กระปุกอาหารติดรหัส": material("กระปุกอาหารติดรหัส", "กระปุกอาหารที่ปิดฝา ฉลาก Lot และเลขกระปุกอ่านชัด", "รับ explant หนึ่งชิ้นต่อกระปุก", `${cultureJars || batch?.explantCount || 1} กระปุกเพาะ`, `อาหาร ${batch?.mediumPerJarMl ?? "ตาม Lot"} mL ต่อกระปุก ฝาปิดสนิทและ Blank ไม่ถูกนำมาใช้`, []),
    "ภาชนะเพาะที่ปิดฝา": material("ภาชนะเพาะที่ปิดฝา", "กระปุกเพาะใส มองผ่านด้านข้างได้ ฉลากยังอ่านชัด และฝาปิดสนิท", "ตรวจเชื้อและการตั้งตัวโดยไม่เปิดฝา", `${cultureJars || "กระปุกเพาะทั้งหมด"} กระปุกเพาะ`, "ตรวจได้รอบด้านโดยไม่ยกฝา และแยกจาก Blank", []),
    "พื้นที่กักภาชนะผิดปกติ": material("พื้นที่กักภาชนะผิดปกติ", "กล่องหรือชั้นที่มีป้าย กัก แยกจากกระปุกปกติ", "แยกกระปุกที่สงสัยปนเปื้อนโดยไม่เปิดฝา", "1 จุดที่วางกระปุกผิดปกติทั้งหมดได้", "อยู่ห่างจากกระปุกปกติ ไม่ถูกแดด และปิดกั้นการล้ม", []),
  };
  const found = common[name];
  if (!found) throw new Error(`Guided Protocol v2 material is not defined: ${name}`);
  return found;
}

function haiterFoodActions(lot: ExperimentLot): string[] {
  const sterilization = lot.sterilization!;
  const source = sterilization.activeChlorinePercent ?? 0;
  const target = sterilization.targetChlorinePercent ?? 0.003;
  const volume = sterilization.mediumVolumeMl ?? 0;
  const minimum = sterilization.minimumToolVolumeMl ?? 0.1;
  if (source <= 0 || volume <= 0) {
    return ["หยุดขั้นนี้และกรอกเปอร์เซ็นต์จากฉลาก Haiter กับปริมาตรอาหารใน Lot ก่อนเริ่ม"];
  }
  const direct = calculateHaiterDose({
    sourcePercent: source,
    targetPercent: target,
    finalVolumeMl: volume,
    minimumMeasurableMl: minimum,
  });
  if (!direct.needsWorkingDilution) {
    return [
      "สวมถุงมือและแว่นตา แล้วเปิดหน้าต่างหรือทำงานในบริเวณที่อากาศถ่ายเท",
      `ตรวจว่ากล่องค่าของ Lot แสดง active chlorine เป้าหมาย ${target}%`,
      `รอให้อาหารมีอุณหภูมิ 55–60°C แล้วตวง Haiter จากขวด ${direct.sourceVolumeMl.toFixed(3)} mL`,
      `เติม Haiter ลงในอาหาร ${volume} mL แล้วใช้แท่งแก้วคนช้า ๆ 10 รอบ`,
      "ปิดภาชนะและติดฉลากชื่อ Lot ปริมาตรอาหาร เปอร์เซ็นต์จากฉลาก วัน และเวลา",
    ];
  }
  const working = planHaiterWorkingDilution({
    sourcePercent: source,
    dilutionFactor: 10,
    workingVolumeMl: 10,
    targetPercent: target,
    finalVolumeMl: volume,
    minimumMeasurableMl: minimum,
  });
  return [
    "สวมถุงมือและแว่นตา แล้วเปิดหน้าต่างหรือทำงานในบริเวณที่อากาศถ่ายเท",
    `ตรวจว่ากล่องค่าของ Lot แสดง active chlorine เป้าหมาย ${target}%`,
    `ตวง Haiter จากขวด ${working.sourceVolumeMl.toFixed(2)} mL ใส่ภาชนะสะอาด`,
    `เติมน้ำปลอดเชื้อ ${working.diluentVolumeMl.toFixed(2)} mL แล้วใช้แท่งแก้วคนช้า ๆ 10 รอบ`,
    `ติดฉลากว่า “Haiter เจือจาง ${working.workingPercent}% — เตรียมใหม่”`,
    `รอให้อาหารมีอุณหภูมิ 55–60°C แล้วตวงสารที่เจือจางแล้ว ${working.workingDoseMl.toFixed(3)} mL ลงในอาหาร ${volume} mL`,
    "ใช้แท่งแก้วคนช้า ๆ 10 รอบ ปิดภาชนะ และติดฉลากชื่อ Lot วัน และเวลา",
  ];
}

function surfaceSterilizationActions(lot: ExperimentLot): string[] {
  const sourcePercent = lot.sterilization?.activeChlorinePercent ?? 0;
  const targetPercent = 0.6;
  if (sourcePercent < targetPercent) {
    return [
      `หยุดขั้นนี้ เพราะ Haiter ${sourcePercent}% เจือจางเกินไปสำหรับเตรียมสารฟอก ${targetPercent}%`,
    ];
  }
  const finalVolumeMl = 100;
  const sourceVolumeMl = targetPercent * finalVolumeMl / sourcePercent;
  const sterileWaterMl = finalVolumeMl - sourceVolumeMl;
  return [
    `ตวง Haiter จากขวด ${sourceVolumeMl.toFixed(2)} mL ใส่ภาชนะสะอาด`,
    `เติมน้ำปลอดเชื้อ ${sterileWaterMl.toFixed(2)} mL จะได้สารฟอก active chlorine ${targetPercent}% ปริมาตร ${finalVolumeMl} mL`,
    "ปิดฝาและเขียนฉลาก “สารฟอกชิ้นพืช 0.6% — ใช้รอบนี้”",
    "ใช้คีมคีบชิ้นพืชลงในสารฟอกให้จมทั้งหมด แล้วปิดฝา",
    "กดเริ่มจับเวลา 8 นาทีทันที",
    lot.sterilization?.rinseWater?.method === "low-dose-hypochlorite"
      ? `ตรวจว่าน้ำล้าง 1, 2 และ 3 เป็นน้ำที่เตรียมไว้และมี active chlorine ${lot.sterilization.rinseWater.targetChlorinePercent ?? 0.003}%`
      : "ตรวจว่าน้ำล้าง 1, 2 และ 3 เป็นน้ำปลอดเชื้อจากแหล่งที่บันทึกไว้ใน Lot",
    "เมื่อครบ 8 นาที ย้ายชิ้นพืชลงน้ำล้าง 1 แล้วแกว่งคีมช้า ๆ 10 รอบ",
    "ย้ายไปน้ำล้าง 2 แล้วแกว่งคีมช้า ๆ 10 รอบ",
    "ย้ายไปน้ำล้าง 3 แล้วแกว่งคีมช้า ๆ 10 รอบ",
  ];
}

export function buildPinkPrincessHaiterProtocolV2(lot: ExperimentLot): ProtocolStep[] {
  const volume = lot.sterilization?.mediumVolumeMl ?? 0;
  const source = lot.sterilization?.activeChlorinePercent ?? 0;
  const target = lot.sterilization?.targetChlorinePercent ?? 0.003;
  const inputs: StepInput[] = [
    {
      id: "mother-health",
      title: "ตรวจต้นแม่และสุขภาพ",
      objective: "ยืนยันว่าต้นแม่ไม่มีอาการที่ต้องหยุดก่อนตัด",
      materials: ["ต้นแม่", "แว่นขยาย", "ป้ายรหัส Lot"],
      actions: [
        "วางต้นในที่สว่างและอ่านรหัสต้นให้ตรงกับ Lot",
        "ตรวจใบทั้งด้านบนและด้านล่างทีละใบ",
        "ตรวจลำต้น ข้อ และรากอากาศว่ามีแมลง เมือก แผลเน่า หรือกลิ่นผิดปกติหรือไม่",
      ],
      checks: ["ไม่พบแมลง เมือก แผลเน่าลุกลาม หรือกลิ่นผิดปกติ"],
      stop: ["หยุดเมื่อพบแมลง เมือก แผลเน่าลุกลาม หรือกลิ่นผิดปกติ"],
    },
    {
      id: "mark-node",
      title: "หาและทำเครื่องหมายข้อกับตาข้าง",
      objective: "เลือกจุดตัดที่มีข้อและตาข้างโดยยังไม่ตัดต้น",
      materials: ["ต้นแม่", "ป้ายหมายเลขข้อ", "ไม้บรรทัด"],
      actions: [
        "หาจุดที่ก้านใบต่อกับลำต้น จุดนั้นคือข้อ",
        "มองหาตุ่มเล็กที่อยู่ชิดข้อ ตุ่มนี้คือตาข้าง",
        "ติดป้ายหมายเลขเหนือข้อที่เลือก และทำเครื่องหมายแนวตัดเหนือกับใต้ข้อโดยไม่ใช้มีด",
      ],
      checks: ["เห็นข้อและตาข้างครบหนึ่งตำแหน่ง", "ต้นแม่ยังไม่ถูกตัด"],
      stop: ["หยุดเมื่อมองไม่เห็นตาข้างหรือส่วนที่เลือกมีแผลเน่า"],
    },
    {
      id: "batch-size",
      title: "กำหนดจำนวนชิ้นพืชและกระปุก",
      objective: "ยืนยันจำนวนชิ้นพืช กระปุกเพาะ Blank และกระปุกสำรอง",
      materials: ["รายการ batch ของ Lot", "กระปุกเพาะ Blank และสำรอง", "ป้ายรหัสกระปุก"],
      actions: [
        `อ่านจำนวนที่บันทึกไว้: ${jarSummary(lot)}`,
        "เขียนรหัสบนป้ายทุกกระปุกก่อนเตรียมอาหาร",
        `ยืนยันว่าปริมาตรอาหารรวมของ Lot คือ ${volume} mL`,
      ],
      checks: ["กระปุกทุกใบมีรหัส", "จำนวนกระปุกตรงกับรายการของ Lot"],
      stop: ["หยุดเมื่อจำนวนกระปุกจริงไม่ตรงกับรายการของ Lot"],
    },
    {
      id: "liquids-stocks",
      title: "เตรียมน้ำ น้ำยา และสารละลายตั้งต้น",
      objective: "จัดของเหลวทั้งหมดให้ครบก่อนเปิดภาชนะเพาะ",
      materials: ["น้ำปลอดเชื้อ", "Haiter ที่ฉลากอ่านเปอร์เซ็นต์ได้", "สารละลายฮอร์โมนที่มีฉลาก", "อุปกรณ์ตวง"],
      actions: [
        `อ่านฉลาก Haiter และยืนยันตัวเลข ${source}% อยู่ติดกับคำว่า sodium hypochlorite หรือ active chlorine`,
        "ตรวจฉลากสารละลายฮอร์โมนให้มีชื่อ ความเข้มข้น หน่วย และวันที่เตรียม",
        ...sterileRinsePreparationActions(lot),
      ],
      checks: ["ฉลากทุกขวดอ่านชื่อ ความเข้มข้น และหน่วยได้", "มีน้ำล้างปลอดเชื้อครบสามภาชนะและปริมาตรตรงกับ Lot"],
      stop: ["หยุดเมื่อฉลากลบ ไม่มีเปอร์เซ็นต์ ไม่ทราบความเข้มข้นของสารละลายฮอร์โมน หรือยังยืนยันแหล่งน้ำล้างปลอดเชื้อไม่ได้"],
      evidenceState: "Experimental",
      referenceIds: ["source-mini-rose-2020", "source-cmru-rose-video-2020"],
    },
    {
      id: "sanitize-vessels",
      title: "ฆ่าเชื้อกระปุกและฝา",
      objective: "เตรียมกระปุก ฝา และถาดพักด้วยวิธี CSUP",
      materials: ["กระปุกและฝา", "Haiter", "น้ำกลั่น", "ถาดพัก", "ตัวจับเวลา"],
      actions: [
        "ล้างกระปุกกับฝาจนไม่มีฟอง ไม่มีคราบลื่น และไม่มีรอยแตก",
        "เตรียมสาร 100 mL โดยตวงผลิตภัณฑ์ Haiter 5 mL แล้วเติมน้ำกลั่นให้ครบ 100 mL",
        "ให้สารสัมผัสด้านใน ขอบปาก และฝาทุกด้าน",
        "คว่ำกระปุกกับฝาบนถาดที่ล้างด้วยสารเดียวกัน แล้วจับเวลา 10 นาที",
      ],
      checks: ["กระปุกไม่มีคราบหรือรอยแตก", "สารสัมผัสด้านใน ขอบปาก และฝาครบ", "ครบเวลา 10 นาที"],
      stop: ["หยุดเมื่อฝาปิดไม่สนิท กระปุกมีรอยแตก หรือมีการผสม Haiter กับสารชนิดอื่น"],
      evidenceState: "Experimental",
      durationMinutes: 10,
      referenceIds: ["source-csup-2012", "source-naocl-vessels-2009"],
    },
    {
      id: "prepare-medium",
      title: "เตรียมอาหาร",
      objective: `เตรียมอาหารปริมาตร ${volume} mL จากค่าที่บันทึกใน Lot`,
      materials: ["MS basal salts", "sucrose", "agar", "สารละลายฮอร์โมน", "เครื่องชั่ง", "เครื่องวัด pH", "เตาและแท่งแก้ว"],
      actions: [
        "อ่านกล่อง “สูตรที่ใช้จริงใน Lot นี้” บนหน้าจอและวางสารเรียงตามลำดับที่แสดง",
        "ชั่ง MS basal salts, sucrose และ agar ตามตัวเลขพร้อมหน่วยที่แสดงบนหน้าจอ",
        "ตวงสารละลายฮอร์โมนตามผลคำนวณที่แสดงบนหน้าจอ",
        `เติมน้ำ คนให้ละลาย ปรับ pH เป็น 5.7–5.8 แล้วเติมน้ำให้ปริมาตรสุดท้าย ${volume} mL`,
        "ให้ความร้อนระดับต่ำถึงปานกลางและคนต่อเนื่องจนไม่เห็นเม็ด agar",
      ],
      checks: ["น้ำหนักและปริมาตรตรงกับกล่องสูตร", "pH อยู่ระหว่าง 5.7–5.8", "ไม่เห็นเม็ด agar"],
      stop: ["หยุดเมื่อค่าบนเครื่องชั่งหรือ pH ไม่อยู่ในช่วงที่แสดง"],
      measurements: [{ id: "medium-ph", label: "pH ที่วัดได้", unit: "pH", required: true, min: 5.7, max: 5.8 }],
    },
    {
      id: "haiter-in-medium",
      title: "เติม Haiter ลงในอาหาร",
      objective: `ทำให้อาหาร ${volume} mL มี active chlorine เป้าหมาย ${target}%`,
      materials: ["อาหารที่อุณหภูมิ 55–60°C", "Haiter", "อุปกรณ์ตวง", "ถุงมือ", "แว่นตา"],
      actions: haiterFoodActions(lot),
      checks: ["อาหารอยู่ที่ 55–60°C ตอนเติม", "ปริมาตรที่ตวงไม่ต่ำกว่าขีดจำกัดอุปกรณ์", "ฉลาก Lot ครบ"],
      stop: ["หยุดเมื่ออาหารร้อนเกิน 60°C หรือยังไม่มีคำสั่งตวงเป็นตัวเลข"],
      evidenceState: "Experimental",
      referenceIds: ["source-csup-2012"],
    },
    {
      id: "blank-48h",
      title: "รอตรวจ Blank 48 ชั่วโมง",
      objective: "ตรวจว่าอาหารและภาชนะไม่แสดงการปนเปื้อนก่อนตัดต้นแม่",
      materials: ["กระปุก Blank ที่ปิดฝา", "ตัวจับเวลาของระบบ"],
      actions: [
        "วางกระปุก Blank ในตำแหน่งเดียวกับกระปุกเพาะโดยไม่เปิดฝา",
        "กดปุ่มเริ่มจับเวลา 48 ชั่วโมง",
        "เมื่อครบเวลา ตรวจหาฝ้า เส้นใย จุดสี เมือก ฟอง หรือกลิ่นที่ออกจากภาชนะปิด",
      ],
      checks: ["ครบเวลา 48 ชั่วโมง", "ไม่เห็นฝ้า เส้นใย จุดสี เมือก หรือฟองผิดปกติ"],
      stop: ["หยุดทั้ง Lot เมื่อ Blank มีฝ้า เส้นใย จุดสี เมือก หรือฟองผิดปกติ"],
      durationMinutes: 2880,
    },
    {
      id: "wash-mother",
      title: "ล้างต้นแม่และเตรียมชิ้นส่วน",
      objective: "ลดดิน ฝุ่น และเศษอินทรีย์ก่อนนำชิ้นพืชเข้าพื้นที่สะอาด",
      materials: ["น้ำสะอาด", "ภาชนะล้าง", "ป้ายรหัส"],
      actions: [
        "ปิดวัสดุปลูกไม่ให้ดินกระเด็นขึ้นลำต้น",
        "ล้างบริเวณยอดและข้อที่เลือกด้วยน้ำไหล โดยใช้นิ้วที่สวมถุงมือลูบสิ่งสกปรกออก",
        "วางต้นบนถาดสะอาดและอ่านรหัส Lot ซ้ำ",
      ],
      checks: ["ไม่เห็นดินหรือเศษวัสดุติดบริเวณข้อที่เลือก"],
      stop: ["หยุดเมื่อพบเนื้อเยื่อช้ำ เน่า หรือข้อที่ทำเครื่องหมายเสียหาย"],
    },
    {
      id: "prepare-sab",
      title: "เตรียมกล่องปลอดเชื้อและเครื่องมือ",
      objective: "จัด SAB และเครื่องมือให้พร้อมก่อนตัด",
      materials: ["Still-Air Box", "สารเช็ดพื้นผิวที่ Lot บันทึก", "คีม", "มีด", "ถุงมือ", "ตัวจับเวลา"],
      actions: [
        "ปิดพัดลม หน้าต่าง และประตู แล้วนำของที่ไม่ใช้พ้นโต๊ะ",
        "เช็ดคราบบนโต๊ะและด้านใน SAB จากด้านบนลงด้านล่าง",
        "เช็ดด้านนอกอุปกรณ์แต่ละชิ้นก่อนนำเข้า SAB",
        "ปิด SAB แล้วจับเวลาให้อากาศนิ่ง 15 นาที",
      ],
      checks: ["ไม่มีคราบหรือแอ่งสาร", "อุปกรณ์อยู่ใน SAB ครบ", "อากาศนิ่งครบ 15 นาที"],
      stop: ["หยุดเมื่อยังมีลม กลิ่นฉุน แอ่งสาร หรืออุปกรณ์ไม่ครบ"],
      durationMinutes: 15,
    },
    {
      id: "cut-before-sterilize",
      title: "ตัดชิ้นพืชก่อนฟอก",
      objective: "ตัดชิ้นที่มีข้อและตาข้างโดยเหลือเนื้อสำหรับตัดแต่งภายหลัง",
      materials: ["ต้นแม่", "มีดหรือกรรไกรสะอาด", "ไม้บรรทัด", "ภาชนะติดรหัส"],
      actions: [
        "อ่านหมายเลขข้อและตรวจว่าตาข้างยังอยู่",
        "ตัดเหนือข้อ 1 cm",
        "ตัดใต้ข้อ 1–1.5 cm",
        "วางชิ้นพืชลงภาชนะที่มีรหัสตรงกับ Lot ทันที",
      ],
      checks: ["ชิ้นพืชมีข้อและตาข้าง", "ด้านบนกับด้านล่างยังแยกได้"],
      stop: ["หยุดเมื่อชิ้นพืชไม่มีตาข้าง แตก ช้ำมาก หรือตกสัมผัสพื้น"],
      evidenceState: "Adapted",
    },
    {
      id: "surface-sterilize",
      title: "ฟอกผิวชิ้นพืชและล้าง",
      objective: "ลดเชื้อบนผิวชิ้นพืชด้วย trial เริ่มต้นที่ระบุชัด",
      materials: ["สารละลาย active chlorine 0.6%", "น้ำล้างปลอดเชื้อ 1–3", "คีม", "ตัวจับเวลา"],
      actions: surfaceSterilizationActions(lot),
      checks: ["ครบเวลาฟอก 8 นาที", "ล้างครบสามภาชนะ", "ตาข้างยังไม่ขาวซีดหรือเละ"],
      stop: ["หยุดเมื่อชิ้นพืชขาวซีด เละ มีกลิ่นผิดปกติ หรือภาชนะล้างหก"],
      evidenceState: "Experimental",
      durationMinutes: 8,
      referenceIds: ["source-mini-rose-2020", "source-cmru-rose-video-2020"],
    },
    {
      id: "trim-place",
      title: "ตัดแต่ง ลงอาหาร และปิดภาชนะ",
      objective: "นำชิ้นที่ล้างแล้วลงอาหารโดยไม่กลับด้านและไม่เปิดภาชนะนาน",
      materials: ["SAB ที่เตรียมแล้ว", "มีดและคีม", "กระปุกอาหารติดรหัส"],
      actions: [
        "นำชิ้นพืชเข้า SAB และเปิดฝากระปุกอาหารเฉพาะตอนพร้อมวาง",
        "ตัดผิวแผลบนและล่างออกด้านละ 2–3 mm โดยไม่ตัดผ่านข้อหรือตาข้าง",
        "วางด้านล่างของชิ้นพืชลงบนอาหารลึก 2–4 mm โดยให้ตาข้างอยู่เหนือผิวอาหาร",
        "ปิดฝาทันทีและอ่านรหัส Lot บนกระปุกซ้ำ",
      ],
      checks: ["ตาข้างอยู่เหนืออาหาร", "กระปุกปิดสนิท", "รหัสกระปุกตรงกับ Lot"],
      stop: ["หยุดเมื่อชิ้นพืชกลับด้าน ตาข้างจมอาหาร หรือฝากระปุกสัมผัสพื้น"],
      evidenceState: "Adapted",
    },
    {
      id: "contamination-establishment",
      title: "ตรวจการปนเปื้อนและการตั้งตัว",
      objective: "ตรวจภาชนะโดยไม่เปิดฝาและแยกภาชนะผิดปกติ",
      materials: ["ภาชนะเพาะที่ปิดฝา", "พื้นที่กักภาชนะผิดปกติ"],
      actions: [
        "ตรวจภาชนะวันละครั้งโดยไม่เปิดฝา",
        "มองหาฝ้า เส้นใย จุดสี เมือก ฟอง เนื้อเยื่อดำลุกลาม หรืออาหารเหลวผิดปกติ",
        "ย้ายภาชนะผิดปกติไปพื้นที่กักโดยไม่เปิดฝา",
        "เมื่อครบ 14 วัน บันทึกจำนวนภาชนะปกติและจำนวนภาชนะที่กัก",
      ],
      checks: ["ไม่มีฝ้า เส้นใย จุดสี เมือก หรือฟอง", "ตาข้างยังเขียวหรือเริ่มบวม"],
      stop: ["กักภาชนะทันทีเมื่อเห็นฝ้า เส้นใย จุดสี เมือก หรือฟอง"],
      durationMinutes: 20160,
      measurements: [
        { id: "healthy-container-count", label: "จำนวนภาชนะปกติ", unit: "count", required: true, min: 0 },
        { id: "quarantined-container-count", label: "จำนวนภาชนะที่กัก", unit: "count", required: true, min: 0 },
      ],
    },
  ];
  const steps = inputs.map((input, index) => step(index, {
    ...input,
    materials: input.materials.map((item) => (
      typeof item === "string" ? guidedMaterial(item, lot) : item
    )),
  }));
  const semanticIssues = guidedProtocolV2SemanticIssues(steps);
  if (semanticIssues.length) {
    throw new Error(`Pink Princess Haiter Protocol v2 ยังไม่สมบูรณ์: ${semanticIssues.join(" · ")}`);
  }
  return steps;
}
