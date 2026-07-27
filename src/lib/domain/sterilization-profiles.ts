import type {
  ProtocolStep,
  SterilizationProfile,
  SterilizationReadiness,
} from "./models";
import { createBeginnerInstruction } from "./zero-knowledge-protocol";

type ProfileGuidance = {
  objective: string;
  materials: string[];
  actions: string[];
  whatToFind: string[];
  stopConditions: string[];
  evidencePrompt: string[];
  readyChecklist: string[];
  nextActionOnPass: string;
  nextActionOnFail: string;
  allowPhoto?: boolean;
};

function guidanceForProfileStep(
  id: string,
  title: string,
  instruction: string,
): ProfileGuidance {
  const shared = {
    objective: title,
    actions: [instruction],
    whatToFind: ["ผลที่ขั้นตอนนี้ระบุ"],
    stopConditions: ["หยุดเมื่อข้อมูล อุปกรณ์ หรือผลที่เห็นไม่ตรงกับคำแนะนำ"],
    evidencePrompt: ["บันทึกค่าที่ใช้จริงและผลที่เห็นจริง"],
    readyChecklist: ["ฉันทำครบตามลำดับ", "ฉันบันทึกข้อมูลจริงแล้ว"],
    nextActionOnPass: "ไปขั้นถัดไปตามรายการ",
    nextActionOnFail: "หยุด บันทึกปัญหา และแก้ไขขั้นนี้ก่อน",
  };
  if (id === "read-haiter-label") return {
    ...shared,
    objective: "อ่านค่าความเข้มข้นที่พิมพ์อยู่บนขวดให้ถูกต้อง",
    materials: ["ขวด Haiter พร้อมฉลาก", "โทรศัพท์หรือกล้อง", "แบบบันทึก"],
    actions: [
      "วางขวดในที่สว่างและหมุนหาด้านที่มีคำว่า sodium hypochlorite, NaOCl หรือ active chlorine",
      "คัดลอกตัวเลขเปอร์เซ็นต์และหน่วยตามฉลากโดยไม่ปัดหรือเดา",
      "ถ่ายรูปฉลากให้เห็นชื่อสาร ตัวเลขเปอร์เซ็นต์ และชื่อผลิตภัณฑ์ในภาพเดียว",
    ],
    whatToFind: ["ตัวเลขเปอร์เซ็นต์ที่อยู่ติดกับ sodium hypochlorite, NaOCl หรือ active chlorine"],
    stopConditions: ["หยุดถ้าฉลากลบ อ่านไม่ได้ หรือมีแต่คำว่าเข้มข้นโดยไม่มีตัวเลขเปอร์เซ็นต์"],
    evidencePrompt: ["บันทึกเปอร์เซ็นต์ตามฉลาก", "ถ่ายรูปฉลาก ไม่ต้องถ่ายต้นไม้"],
    readyChecklist: ["ฉันเห็นชื่อสารและตัวเลขเปอร์เซ็นต์ชัด", "ฉันคัดลอกค่าและถ่ายฉลากแล้ว"],
    nextActionOnPass: "กรอกค่าจากฉลากให้ระบบคำนวณปริมาตร",
    nextActionOnFail: "งดใช้ผลิตภัณฑ์นี้และเลือกผลิตภัณฑ์ที่ฉลากระบุชื่อสารกับเปอร์เซ็นต์ชัดเจน แล้วเริ่มขั้นอ่านฉลากใหม่",
  };
  if (id === "calculate-haiter-dose") return {
    ...shared,
    objective: "ให้ระบบคำนวณปริมาตรจากค่าที่อ่านได้จริง",
    materials: ["รูปฉลาก Haiter", "แบบบันทึก", "ปิเปตหรือกระบอกตวง"],
    actions: [
      "กรอกเปอร์เซ็นต์จากฉลาก",
      "กรอกปริมาตรอาหารทั้งหมดและปริมาตรต่ำสุดที่อุปกรณ์ตวงได้",
      "อ่านคำสั่งที่ระบบแสดงและคัดลอกปริมาตรลงบันทึก ห้ามคำนวณด้วยการกะหรือจำนวนหยด",
    ],
    whatToFind: [
      "เปอร์เซ็นต์ NaOCl ที่คัดลอกจากฉลาก",
      "ปริมาตรอาหารทั้งหมดที่ต้องการเตรียม หน่วย mL",
      "ปริมาตรต่ำสุดที่ปิเปตหรือกระบอกตวงวัดได้ หน่วย mL",
      "ผลคำนวณที่ระบุปริมาตร Haiter และบอกชัดว่าตวงโดยตรงหรือต้องเจือจางก่อน",
    ],
    stopConditions: ["หยุดถ้าช่องใดไม่มีค่าจริง หรือระบบแจ้งว่ายังคำนวณไม่ได้"],
    evidencePrompt: ["บันทึกค่าทั้งสามช่องและคำสั่งตวงที่ระบบแสดง"],
    readyChecklist: ["ค่าทุกช่องมาจากฉลากหรือเครื่องมือจริง", "ฉันอ่านคำสั่งตวงครบแล้ว"],
    nextActionOnPass: "เตรียมอาหารตามคำสั่งตวงที่ระบบแสดง",
    nextActionOnFail: "ย้อนกลับไปตรวจฉลาก ปริมาตรอาหาร และช่วงการตวงของอุปกรณ์",
    allowPhoto: false,
  };
  if (id === "prepare-haiter-working-dilution") return {
    ...shared,
    objective: "เจือจาง Haiter ให้ได้ปริมาตรที่อุปกรณ์ตวงได้อย่างแม่นยำ",
    materials: ["Haiter ที่อ่านฉลากแล้ว", "น้ำปลอดเชื้อ", "ปิเปตหรือกระบอกตวง", "ภาชนะสะอาด", "ป้ายฉลาก"],
    actions: [
      "เปิดผลคำนวณจากขั้นก่อนหน้า ถ้าระบบบอกว่าสามารถตวง Haiter โดยตรงได้ ให้บันทึกว่าไม่ต้องเจือจางและจบขั้นนี้",
      "ถ้าระบบบอกให้เจือจาง ให้ตวง Haiter และน้ำปลอดเชื้อตามปริมาตรที่ระบบแสดง ห้ามเปลี่ยนเป็นการนับหยด",
      "ผสมในภาชนะสะอาด แล้วติดฉลากว่า Haiter working dilution พร้อมความเข้มข้น วันที่ เวลา และผู้เตรียม",
      "ตรวจว่าปริมาตร working dilution ที่จะนำไปเติมอาหารมากกว่าหรือเท่ากับค่าต่ำสุดที่อุปกรณ์ตวงได้",
    ],
    whatToFind: [
      "คำสั่งจากระบบว่าต้องเจือจางหรือไม่",
      "ปริมาตร Haiter และน้ำปลอดเชื้อที่ต้องใช้",
      "ความเข้มข้นของ working dilution",
      "ปริมาตร working dilution ที่ต้องเติมลงอาหาร",
    ],
    stopConditions: [
      "หยุดถ้าค่าใดค่าหนึ่งไม่มีตัวเลขหรือหน่วย",
      "หยุดถ้ายังต้องกะด้วยหยด หรือปริมาตรยังต่ำกว่าค่าต่ำสุดของอุปกรณ์",
    ],
    evidencePrompt: ["บันทึกค่าที่ระบบแสดงและถ่ายฉลาก working dilution ที่เตรียมเสร็จ"],
    readyChecklist: ["ฉันตวงตามค่าจากระบบโดยไม่กะ", "ฉันติดฉลาก working dilution ครบ", "ปริมาตรที่จะเติมอยู่ในช่วงที่อุปกรณ์ตวงได้"],
    nextActionOnPass: "นำ working dilution ไปใช้ตามปริมาตรที่ระบบกำหนดในขั้นเตรียมอาหาร",
    nextActionOnFail: "หยุดและกลับไปคำนวณใหม่หรือเปลี่ยนอุปกรณ์ตวง",
  };
  if (id === "prepare-haiter-medium") return {
    ...shared,
    objective: "เตรียมอาหารเพาะและติดตาม batch โดยไม่สัมผัสต้นไม้ในขั้นนี้",
    materials: [
      "MS basal salts ตามสูตร",
      "น้ำตาล sucrose",
      "วุ้น agar",
      "สารละลาย stock hormone ตาม Protocol",
      "น้ำและภาชนะผสมที่เหมาะสม",
      "เครื่องวัด pH",
      "เครื่องชั่งและอุปกรณ์ตวง",
      "Haiter ที่อ่านฉลากแล้ว",
      "ภาชนะเพาะ ฝา ป้าย batch และปากกา",
      "ถุงมือและแว่นตา",
    ],
    actions: [
      "เปิดสูตรของ Protocol version นี้และเลือกปริมาตร batch ที่จะทำ",
      "ชั่ง MS, sucrose และ agar ตามตาราง แล้วเติม stock hormone ตามปริมาตรที่คำนวณไว้",
      "เติมน้ำเกือบครบปริมาตร คนให้ละลาย แล้วปรับ pH ตามช่วงที่สูตรระบุ",
      "ปรับปริมาตรสุดท้ายและทำให้วุ้นละลายตามวิธีของห้อง",
      "รอให้อาหารเย็นถึงเงื่อนไขที่ Protocol กำหนดก่อนเติม Haiter ตามปริมาตรที่ระบบคำนวณ ห้ามเดาด้วยหยด",
      "แบ่งลงภาชนะ ปิดฝา และติดป้าย batch id สูตร ปริมาตร วันที่ และวิธี Haiter",
    ],
    whatToFind: ["น้ำหนักและปริมาตรตรงกับสูตร", "pH อยู่ในช่วงที่กำหนด", "ทุกภาชนะมีฉลาก batch เดียวกัน"],
    stopConditions: [
      "หยุดถ้าชั่งผิด สูตรไม่ตรง pH นอกช่วง หรือปริมาตร Haiter ต่ำกว่าอุปกรณ์ตวง",
      "หยุดทันทีหาก Haiter สัมผัสกรด แอมโมเนีย แอลกอฮอล์ หรือสารทำความสะอาดอื่น",
    ],
    evidencePrompt: [
      "ถ่ายรูปฉลาก batch และภาชนะอาหาร ไม่ต้องถ่ายต้นไม้",
      "บันทึกสูตร ปริมาตร pH ปริมาตร Haiter เวลา และผู้เตรียม",
    ],
    readyChecklist: ["สูตรและปริมาตรถูกบันทึก", "pH ถูกบันทึก", "ทุกภาชนะปิดและติดฉลาก"],
    nextActionOnPass: "ตั้ง Blank และรอตรวจตามช่วงเวลาของ Protocol",
    nextActionOnFail: "แยก batch นี้ ห้ามใช้กับ explant และเตรียม batch ใหม่",
  };
  if (id === "record-blank-decision") return {
    ...shared,
    objective: "ตรวจว่าอาหารและภาชนะยังไม่มีสัญญาณปนเปื้อนก่อนตัดต้น",
    materials: ["ภาชนะ Blank ที่ไม่ใส่ชิ้นพืช", "ป้าย batch", "โทรศัพท์หรือกล้อง", "แบบบันทึก"],
    actions: [
      "ตรวจรหัส Blank ให้ตรงกับ batch อาหาร",
      "มองผ่านภาชนะโดยไม่เปิดฝา หาเส้นใย ฝ้า เมือก สีหรือกลิ่นผิดปกติ",
      "ถ่ายรูป Blank และบันทึกวันเวลาที่ตรวจ หากข้ามให้เขียนเหตุผลและความเสี่ยง",
    ],
    whatToFind: ["อาหารยังใสหรือมีลักษณะตามสูตร ไม่มีรา เมือก หรือการเปลี่ยนสีผิดปกติ"],
    stopConditions: ["หยุดและกักทั้ง batch หาก Blank มีการปนเปื้อนหรือฉลากไม่ตรง"],
    evidencePrompt: ["ถ่ายรูปภาชนะ Blank และฉลาก batch ไม่ต้องถ่ายต้นไม้"],
    readyChecklist: ["ฉันตรวจโดยไม่เปิดฝา", "ฉันบันทึกผลหรือเหตุผลที่ข้ามแล้ว"],
    nextActionOnPass: "เตรียมพื้นที่ปลอดเชื้อและตรวจความพร้อมก่อนตัด",
    nextActionOnFail: "กัก batch ห้ามใช้กับ explant และตรวจหาสาเหตุ",
  };
  if (id === "prepare-pressure-medium") return {
    ...shared,
    objective: "เตรียมอาหารและภาชนะให้พร้อมสำหรับหม้อนึ่งแรงดัน",
    materials: ["ส่วนประกอบอาหารตามสูตร", "เครื่องชั่งและอุปกรณ์ตวง", "เครื่องวัด pH", "ภาชนะทนความร้อน", "ป้ายทนความร้อน"],
    actions: [
      "ชั่งและผสมอาหารตาม Protocol version",
      "ปรับ pH และปริมาตรสุดท้าย",
      "แบ่งลงภาชนะทนความร้อน ปิดตาม SOP และติด batch id",
    ],
    whatToFind: ["สูตร pH ปริมาตร และ batch id ครบ"],
    stopConditions: ["หยุดถ้าภาชนะไม่ระบุว่าทนความร้อน/ความดัน หรือข้อมูล batch ไม่ครบ"],
    evidencePrompt: ["ถ่ายรูปภาชนะและฉลาก batch ก่อนนึ่ง ไม่ต้องถ่ายต้นไม้"],
    readyChecklist: ["ภาชนะเหมาะกับแรงดัน", "สูตร pH และ batch ถูกบันทึก"],
    nextActionOnPass: "ฆ่าเชื้ออาหารด้วยหม้อนึ่งตาม SOP",
    nextActionOnFail: "แก้สูตร ภาชนะ หรือฉลากก่อนเริ่มเครื่อง",
  };
  if (id === "pressure-sterilize-medium") return {
    ...shared,
    objective: "ฆ่าเชื้ออาหารด้วยเงื่อนไขที่ตรวจสอบย้อนกลับได้",
    materials: ["หม้อนึ่งแรงดันหรือ autoclave", "ภาชนะอาหารที่เตรียมแล้ว", "ตัวบันทึกเวลา/อุณหภูมิ/ความดัน", "ถุงมือกันความร้อน"],
    actions: [
      "จัดภาชนะและใช้งานเครื่องตามคู่มือผู้ผลิตและ SOP ของพื้นที่",
      "บันทึกเวลา อุณหภูมิ และความดันจริงของรอบ",
      "รอให้ความดันเป็นศูนย์และอาหารเย็นก่อนเคลื่อนย้ายหรือตรวจ",
    ],
    whatToFind: ["รอบฆ่าเชื้อจบครบเงื่อนไข ภาชนะไม่รั่ว แตก หรือฝาเปิด"],
    stopConditions: ["หยุดหากไม่เคยได้รับการฝึกใช้เครื่อง เครื่องผิดปกติ หรือความดันยังไม่เป็นศูนย์"],
    evidencePrompt: ["บันทึกค่ารอบเครื่องและถ่ายฉลาก batch/ผลตัวบ่งชี้ ไม่ต้องถ่ายต้นไม้"],
    readyChecklist: ["รอบเครื่องครบตาม SOP", "ความดันเป็นศูนย์และภาชนะปลอดภัยต่อการจับ"],
    nextActionOnPass: "ตั้ง Blank และรอตรวจตาม Protocol",
    nextActionOnFail: "กัก batch หยุดใช้เครื่อง และทำตามคู่มือแก้ปัญหาของผู้ผลิต ห้ามเปิดเครื่องหรือเริ่มรอบใหม่จนค่าความดันเป็นศูนย์และเครื่องกลับสู่สถานะพร้อม",
  };
  if (id === "sterilization-readiness-gate") return {
    ...shared,
    objective: "ยืนยันว่าอาหาร พื้นที่ และอุปกรณ์พร้อมก่อนทำให้ต้นแม่เกิดบาดแผล",
    materials: ["รายการตรวจอาหารและ Blank", "รายการอุปกรณ์ปลอดเชื้อ", "รูปพื้นที่ทำงาน", "แบบบันทึก"],
    actions: [
      "ตรวจว่า batch อาหารและ Blank ผ่านหรือมีเหตุผลที่ข้าม",
      "ตรวจภาชนะ เครื่องมือ และพื้นที่สะอาดว่าพร้อมใช้งาน",
      "บันทึกผลทุกข้อก่อนเปิดขั้นตัดต้น",
    ],
    whatToFind: ["อาหาร ภาชนะ เครื่องมือ พื้นที่ และบันทึก Blank พร้อมครบ"],
    stopConditions: ["หยุดถ้าขาดข้อใดข้อหนึ่ง ห้ามตัดต้นไว้รอ"],
    evidencePrompt: ["ถ่ายภาพพื้นที่และอุปกรณ์ที่จัดเตรียมแล้ว ไม่ต้องถ่ายต้นไม้ในขั้นนี้"],
    readyChecklist: ["อาหารและภาชนะพร้อม", "พื้นที่และเครื่องมือพร้อม", "Blank ถูกบันทึกแล้ว"],
    nextActionOnPass: "เปิดขั้นตัดและเตรียม explant",
    nextActionOnFail: "จัดเตรียมรายการที่ขาดแล้วตรวจซ้ำ",
  };
  return {
    ...shared,
    materials: ["แบบบันทึก", "อุปกรณ์ที่ระบุชื่อใน Protocol"],
  };
}

function profileStep(
  id: string,
  title: string,
  instruction: string,
  evidenceState: ProtocolStep["evidenceState"] = "Experimental",
): ProtocolStep {
  const guidance = guidanceForProfileStep(id, title, instruction);
  return {
    id,
    order: 0,
    title,
    instruction,
    durationMinutes: null,
    criticalControls: [],
    safetyNotes: [],
    referenceIds: [],
    evidenceState,
    workflowPhase: "medium-preparation",
    allowNote: true,
    objective: guidance.objective,
    whyItMatters: `ใช้ลดความผิดพลาดในขั้น “${title}” และทำให้ย้อนตรวจค่าที่ใช้จริงได้`,
    expectedResult: guidance.whatToFind.join("; "),
    passCriteria: guidance.readyChecklist,
    failCriteria: guidance.stopConditions,
    nextActionOnPass: guidance.nextActionOnPass,
    nextActionOnFail: guidance.nextActionOnFail,
    materials: guidance.materials,
    allowPhoto: guidance.allowPhoto ?? true,
    requiredEvidence: ["note"],
    beginner: createBeginnerInstruction({
      currentAction: title,
      actions: guidance.actions,
      materials: guidance.materials,
      doNotDoYet: ["อย่าเดาค่า อย่าเปลี่ยนอุปกรณ์ และอย่าข้ามขั้นตอนเอง"],
      whatToFind: guidance.whatToFind,
      stopConditions: guidance.stopConditions,
      evidencePrompt: guidance.evidencePrompt,
      readyChecklist: guidance.readyChecklist,
      scienceNote: `ขั้น “${title}” ใช้ควบคุมความเสี่ยงก่อนทำขั้นถัดไป`,
    }),
  };
}

const commonBlankStep = profileStep(
  "record-blank-decision",
  "ตรวจ Blank หรือบันทึกเหตุผลที่ข้าม",
  "ตรวจภาชนะ Blank ตามช่วงเวลาที่ Protocol กำหนด หากข้ามต้องบันทึกเหตุผลและยอมรับความเสี่ยง",
  "Adapted",
);

export const sterilizationProfiles: SterilizationProfile[] = [
  {
    id: "haiter-chemical-v1",
    title: "Haiter / sodium hypochlorite สำหรับ Home Lab",
    method: "haiter-chemical",
    version: "1.0.0",
    evidenceState: "Experimental",
    referenceIds: [],
    equipmentRequirements: [
      "ฉลากที่ระบุ % sodium hypochlorite หรือ active chlorine",
      "อุปกรณ์วัดปริมาตรที่อ่านค่าต่ำสุดได้",
      "MS basal salts ตามสูตร",
      "น้ำตาล sucrose และวุ้น agar",
      "stock hormone ตามสูตรและอุปกรณ์ตวงที่ครอบคลุมปริมาตร",
      "เครื่องชั่งที่ละเอียดพอสำหรับค่าตามสูตร",
      "เครื่องวัด pH หรือแถบ pH ช่วงแคบที่สูตรอนุญาต",
      "ภาชนะอาหารและภาชนะ Blank",
      "ถุงมือ แว่นตานิรภัย และพื้นที่ระบายอากาศ",
      "พื้นที่สะอาดสำหรับเตรียมอาหารและติดฉลาก batch",
    ],
    blankPolicy: "recommended-skippable",
    steps: [
      profileStep(
        "read-haiter-label",
        "อ่านความเข้มข้นจากฉลาก Haiter",
        "บันทึก % sodium hypochlorite หรือ active chlorine ตามฉลาก ห้ามคาดเดาจากชื่อสินค้า",
      ),
      {
        ...profileStep(
          "calculate-haiter-dose",
          "ให้ระบบหาปริมาตร Haiter ที่ต้องใช้",
          "กรอกเปอร์เซ็นต์จากฉลาก ปริมาตรอาหาร และค่าต่ำสุดที่อุปกรณ์ตวงได้ แล้วอ่านคำสั่งตวงที่ระบบแสดง ห้ามคำนวณหรือเดาด้วยตนเอง",
        ),
        requiredEvidence: ["note", "measurement"],
        measurements: [
          { id: "haiter-source-percent", label: "เปอร์เซ็นต์จากฉลาก Haiter", unit: "%", min: 0, required: true },
          { id: "medium-volume-ml", label: "ปริมาตรอาหารทั้งหมด", unit: "mL", min: 1, required: true },
          { id: "minimum-tool-volume-ml", label: "ปริมาตรต่ำสุดที่อุปกรณ์ตวงได้", unit: "mL", min: 0.001, required: true },
        ],
      },
      {
        ...profileStep(
          "prepare-haiter-working-dilution",
          "เตรียม Working dilution เมื่อปริมาตรตรงเล็กเกินวัด",
          "ทำขั้นนี้เฉพาะเมื่อปริมาตร Haiter ที่คำนวณได้ต่ำกว่าค่าต่ำสุดของเครื่องมือ: 1) เลือก dilution factor ที่ทำให้ทั้งปริมาตรตั้งต้นและปริมาตรที่จะเติมวัดได้ 2) คำนวณ Cworking = Csource ÷ dilution factor 3) ตัวอย่าง 1:10 จาก Haiter 6% ปริมาตร working solution 10 mL: ตวง Haiter 1 mL เติมสารเจือจางที่ Protocol อนุญาต 9 mL จะได้ working solution 0.6% 4) ผสมและติดฉลากชื่อ ความเข้มข้น วันเวลา และผู้เตรียม 5) ใช้ CworkingV1 = CtargetVfinal คำนวณ V1 ใหม่จาก working solution 6) ตรวจว่า V1 ใหม่ไม่น้อยกว่าขีดจำกัดเครื่องมือ หากยังน้อยให้หยุดและวางแผน dilution factor ใหม่ ห้ามประมาณด้วยหยด หากปริมาตรตรงวัดได้อยู่แล้ว ให้บันทึกว่าไม่ต้องเจือจางและผ่านขั้นนี้",
        ),
        objective: "ทำให้ปริมาตรสารที่ต้องเติมอยู่ในช่วงที่อุปกรณ์วัดได้อย่างน่าเชื่อถือ",
        whyItMatters: "การประมาณปริมาตรเล็กมากทำให้ความเข้มข้นคลอรีนจริงคลาดเคลื่อนและอาจทำให้อาหารไม่ปลอดเชื้อหรือเป็นพิษต่อ explant",
        prerequisites: [
          "อ่าน % active chlorine จากฉลากแล้ว",
          "คำนวณ direct dose แล้ว",
          "ทราบค่าต่ำสุดที่อุปกรณ์วัดได้",
        ],
        materials: [
          "Haiter ตามฉลาก",
          "สารเจือจางที่ Protocol อนุญาต",
          "ปิเปตหรือกระบอกตวงที่เหมาะกับช่วงปริมาตร",
          "ภาชนะสะอาดและฉลาก",
        ],
        criticalControls: [
          "ใช้สารเจือจางที่ Protocol อนุญาตและติดฉลากทันที",
          "คำนวณจาก % active chlorine บนฉลาก ไม่ใช้ชื่อผลิตภัณฑ์แทนค่า",
          "ห้ามใช้การนับหยดแทนเครื่องมือวัดปริมาตร",
          "Working dilution ต้องเตรียมใหม่ตามข้อกำหนดของ Protocol และไม่เก็บโดยไม่มีข้อมูลความคงตัว",
        ],
        safetyNotes: [
          "สวมถุงมือและแว่นตา ทำในพื้นที่ระบายอากาศ",
          "ห้ามผสม sodium hypochlorite กับกรด แอมโมเนีย หรือสารทำความสะอาดอื่น",
        ],
        expectedResult: "ได้ working solution ที่ติดฉลากครบ และปริมาตร V1 ใหม่อยู่ในช่วงที่อุปกรณ์วัดได้",
        passCriteria: [
          "บันทึก Csource, dilution factor, Cworking และ V1 ใหม่ครบ",
          "ปริมาตรทุกค่าที่ตวงไม่น้อยกว่าขีดจำกัดเครื่องมือ",
        ],
        failCriteria: [
          "ต้องประมาณด้วยหยด",
          "ไม่ทราบ % จากฉลาก",
          "V1 ใหม่ยังต่ำกว่าขีดจำกัดเครื่องมือ",
        ],
        nextActionOnPass: "ใช้ working solution ตาม V1 ใหม่ในขั้นเตรียมอาหาร",
        nextActionOnFail: "หยุดและคำนวณ dilution factor/ปริมาตร working solution ใหม่",
        requiredEvidence: ["note"],
        measurements: [
          { id: "haiter-source-percent", label: "Csource จากฉลาก", unit: "%", min: 0 },
          { id: "working-dilution-factor", label: "Dilution factor", unit: "count", min: 1 },
          { id: "working-percent", label: "Cworking", unit: "%", min: 0 },
          { id: "working-source-volume", label: "ปริมาตร Haiter ที่ใช้ทำ working solution", unit: "mL", min: 0 },
          { id: "working-diluent-volume", label: "ปริมาตรสารเจือจาง", unit: "mL", min: 0 },
          { id: "working-dose-volume", label: "V1 ใหม่ที่เติมในอาหาร", unit: "mL", min: 0 },
        ],
      },
      profileStep(
        "prepare-haiter-medium",
        "เตรียมอาหารแบบ Haiter",
        "เลือกสูตรตาม Protocol version ชั่ง MS น้ำตาล วุ้น และ stock hormones ปรับ pH ติด batch id แล้วเติม Haiter ตามค่าที่คำนวณ",
      ),
      commonBlankStep,
    ],
  },
  {
    id: "pressure-sterilization-v1",
    title: "หม้อนึ่งแรงดัน",
    method: "pressure-sterilization",
    version: "1.0.0",
    evidenceState: "Adapted",
    referenceIds: [],
    equipmentRequirements: [
      "หม้อนึ่งแรงดันหรือ autoclave",
      "ภาชนะทนความร้อนและความดัน",
      "ตัวบันทึกเวลาและเงื่อนไขการฆ่าเชื้อ",
      "MS basal salts น้ำตาล sucrose วุ้น agar และ stock hormone ตามสูตร",
      "เครื่องชั่ง อุปกรณ์ตวง และเครื่องวัด pH",
      "ถุงมือกันความร้อน แว่นตานิรภัย และพื้นที่วางภาชนะร้อน",
    ],
    blankPolicy: "recommended-skippable",
    steps: [
      profileStep(
        "prepare-pressure-medium",
        "เตรียมอาหารสำหรับหม้อนึ่งแรงดัน",
        "เลือกสูตรตาม Protocol version ชั่ง MS น้ำตาล วุ้น และ stock hormones ปรับ pH บรรจุภาชนะ และติดป้าย batch ก่อนฆ่าเชื้อ",
        "Adapted",
      ),
      profileStep(
        "pressure-sterilize-medium",
        "ฆ่าเชื้ออาหารด้วยความดัน",
        "ใช้เงื่อนไขอุณหภูมิ ความดัน และเวลาตาม Protocol version แล้วทำให้อาหารเย็นก่อนตรวจ",
        "Adapted",
      ),
      commonBlankStep,
    ],
  },
];

export function profileById(profileId: string): SterilizationProfile {
  const profile = sterilizationProfiles.find((candidate) => candidate.id === profileId);
  if (!profile) throw new Error(`ไม่พบ Sterilization Profile: ${profileId}`);
  return structuredClone(profile);
}

export function canUnlockExplantSteps(readiness: SterilizationReadiness): boolean {
  const physicalChecks = readiness.mediumReady
    && readiness.containersReady
    && readiness.workspaceReady
    && readiness.toolsReady;
  const blankRecorded = readiness.blankDecision === "completed"
    || readiness.blankSkipReason.trim().length > 0;
  return physicalChecks && blankRecorded;
}

function readinessStep(): ProtocolStep {
  return {
    ...profileStep(
      "sterilization-readiness-gate",
      "ตรวจความพร้อมก่อนตัดต้น",
      "ยืนยันว่าอาหาร ภาชนะ เครื่องมือ และพื้นที่พร้อม รวมทั้งบันทึกผล Blank หรือเหตุผลที่ข้าม",
      "Adapted",
    ),
    workflowPhase: "readiness",
    criticalControls: ["อย่าเพิ่งตัดต้นไม้จนกว่าขั้นนี้จะผ่าน"],
  };
}

function classifyBaseStep(step: ProtocolStep): ProtocolStep {
  const title = step.title.toLowerCase();
  if (
    title.includes("baseline")
    || title.includes("รับต้นไม้")
    || title.includes("ตรวจสุขภาพ")
    || title.includes("ยืนยันชนิด")
  ) {
    return { ...step, workflowPhase: "baseline" };
  }
  if (
    title.includes("เลือกตำแหน่ง")
    || title.includes("เลือกยอด/ข้อ/ตาข้าง")
  ) {
    return {
      ...step,
      title: "ทำเครื่องหมายตำแหน่ง explant (ยังไม่ตัด)",
      instruction: `${step.instruction} ขั้นนี้ให้ถ่ายรูปและทำเครื่องหมายเท่านั้น ยังไม่ตัดต้นแม่`,
      workflowPhase: "mark-explant",
    };
  }
  if (
    title.includes("ตัดและเตรียมชิ้นพืช")
    || title.includes("ตัดและเตรียม explant")
  ) {
    return { ...step, workflowPhase: "explant-cut" };
  }
  if (title.includes("ฟอกฆ่าเชื้อ")) {
    return {
      ...step,
      title: "ฟอกฆ่าเชื้อผิว explant",
      workflowPhase: "surface-sterilization",
    };
  }
  if (title.includes("เตรียมพื้นที่ปลอดเชื้อ")) {
    return { ...step, workflowPhase: "medium-preparation" };
  }
  return { ...step, workflowPhase: "culture" };
}

export function composeGuidedSteps(
  baseSteps: ProtocolStep[],
  profile: SterilizationProfile,
): ProtocolStep[] {
  const classified = baseSteps.map(classifyBaseStep);
  const beforeCut = classified.filter((step) =>
    step.workflowPhase !== "explant-cut"
    && step.workflowPhase !== "surface-sterilization"
    && !step.title.includes("เตรียมอาหารและอุปกรณ์"));
  const cutAndSurface = classified.filter((step) =>
    step.workflowPhase === "explant-cut" || step.workflowPhase === "surface-sterilization");
  const remaining = beforeCut.filter((step) => step.workflowPhase === "culture");
  const preparation = beforeCut.filter((step) =>
    step.workflowPhase === "baseline" || step.workflowPhase === "mark-explant");
  const workspace = beforeCut.filter((step) => step.workflowPhase === "medium-preparation");
  const composed = [
    ...preparation,
    ...profile.steps
      .filter((step) => step.id !== "prepare-haiter-working-dilution")
      .map((step) => structuredClone(step)),
    ...workspace,
    readinessStep(),
    ...cutAndSurface,
    ...remaining,
  ];

  return composed.map((step, order) => ({
    ...step,
    order,
    beginner: step.beginner ?? createBeginnerInstruction({
      currentAction: step.objective ?? step.title,
      actions: [step.instruction],
      materials: step.materials,
      doNotDoYet: step.criticalControls,
      whatToFind: step.expectedResult ? [step.expectedResult] : undefined,
      stopConditions: step.failCriteria,
      readyChecklist: step.passCriteria,
      scienceNote: step.whyItMatters ?? step.objective ?? `ขั้นนี้ช่วยให้ทำ “${step.title}” อย่างเป็นลำดับ`,
    }),
  }));
}
