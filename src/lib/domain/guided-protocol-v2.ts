import type {
  BeginnerInstruction,
  EvidenceState,
  ExperimentLot,
  ProtocolStep,
  StepMeasurement,
} from "./models";
import { calculateHaiterDose, planHaiterWorkingDilution } from "./haiter-calculations";
import { createBeginnerInstruction } from "./zero-knowledge-protocol";

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
  materials: string[];
  checks: string[];
  stop: string[];
  evidenceState?: EvidenceState;
  referenceIds?: string[];
  durationMinutes?: number | null;
  measurements?: StepMeasurement[];
};

function step(order: number, input: StepInput): ProtocolStep {
  const beginner: BeginnerInstruction = createBeginnerInstruction({
    currentAction: input.objective,
    actions: input.actions,
    materials: input.materials,
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
    materials: input.materials,
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

function surfaceSterilizationActions(sourcePercent: number): string[] {
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
      materials: ["รายการ batch ของ Lot", "ป้ายรหัสกระปุก"],
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
        "จัดน้ำล้างปลอดเชื้อสามภาชนะและติดป้าย น้ำล้าง 1, น้ำล้าง 2 และน้ำล้าง 3",
      ],
      checks: ["ฉลากทุกขวดอ่านชื่อ ความเข้มข้น และหน่วยได้", "มีน้ำล้างครบสามภาชนะ"],
      stop: ["หยุดเมื่อฉลากลบ ไม่มีเปอร์เซ็นต์ หรือไม่ทราบความเข้มข้นของสารละลายฮอร์โมน"],
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
      actions: surfaceSterilizationActions(source),
      checks: ["ครบเวลาฟอก 8 นาที", "ล้างครบสามภาชนะ", "ตาข้างยังไม่ขาวซีดหรือเละ"],
      stop: ["หยุดเมื่อชิ้นพืชขาวซีด เละ มีกลิ่นผิดปกติ หรือภาชนะล้างหก"],
      evidenceState: "Experimental",
      durationMinutes: 8,
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
  return inputs.map((input, index) => step(index, input));
}
