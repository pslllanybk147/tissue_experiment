import type {
  ProtocolStep,
  SterilizationProfile,
  SterilizationReadiness,
  WorkspaceSetupSnapshot,
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
  if (id === "sanitize-haiter-vessels") return {
    ...shared,
    objective: "ทำความสะอาดและฆ่าเชื้อภาชนะเพาะ ฝา และถาดพักก่อนแบ่งอาหาร",
    materials: [
      "ภาชนะเพาะและฝาที่ไม่มีรอยแตก",
      "น้ำยาล้างภาชนะและน้ำสะอาด",
      "น้ำกลั่นหรือน้ำ deionized",
      "Haiter/bleach ที่ฉลากระบุ sodium hypochlorite",
      "ภาชนะพลาสติกสำหรับแช่ที่ทนสารละลาย",
      "ถาดพักสะอาด",
      "ถุงมือ แว่นตานิรภัย และตัวจับเวลา",
    ],
    actions: [
      "ตรวจภาชนะและฝาทีละชิ้น ทิ้งชิ้นที่แตก บิ่น บิดงอ ปิดไม่สนิท หรือมีคราบที่ล้างไม่ออก",
      "ล้างภาชนะและฝาด้วยน้ำยาล้างภาชนะ แล้วล้างน้ำจนไม่มีฟองหรือคราบลื่น",
      "ล้างรอบสุดท้ายด้วยน้ำกลั่นหรือน้ำ deionized แล้วคว่ำให้สะเด็ดน้ำบนพื้นที่สะอาด",
      "สำหรับวิธีทดลอง CSUP นี้ ให้เตรียมสารละลาย 5% v/v ของผลิตภัณฑ์ bleach: ทุกปริมาตรสุดท้าย 100 mL ใช้ผลิตภัณฑ์ 5 mL แล้วเติมน้ำกลั่นให้ครบ 100 mL ค่านี้ไม่ใช่ active chlorine 5%",
      "ล้างถาดพักด้วยสารละลายเดียวกัน",
      "จุ่มภาชนะในสารละลาย วางแนวนอนและหมุนหลายรอบให้สารสัมผัสผิวด้านในทั้งหมด",
      "คว่ำปากภาชนะลงในสารละลายและหมุนหลายรอบให้สารสัมผัสขอบปากครบวง",
      "จุ่มฝาให้สารสัมผัสทุกด้าน แล้ววางภาชนะและฝาคว่ำบนถาดที่ล้างด้วยสารละลายแล้วเป็นเวลา 10 นาที",
      "หลังครบเวลา ห้ามล้างซ้ำด้วยน้ำที่ไม่ได้ทำให้ปลอดเชื้อ ให้แบ่งอาหารและปิดฝาตามขั้นถัดไปโดยลดเวลาที่ภาชนะเปิด",
      "ติดรหัสภาชนะทุกใบและกันอย่างน้อยหนึ่งใบเป็น Blank control",
    ],
    whatToFind: [
      "ภาชนะใส ไม่มีคราบ ไม่มีรอยแตก และฝาปิดได้สนิท",
      "สารละลายสัมผัสด้านใน ขอบปาก และฝาครบ",
      "ภาชนะคว่ำบนถาดที่ผ่านสารละลายครบ 10 นาที",
    ],
    stopConditions: [
      "หยุดถ้าไม่ทราบความเข้มข้นหรือส่วนประกอบบนฉลากผลิตภัณฑ์",
      "หยุดถ้าภาชนะไม่ทนสาร มีรอยแตก ฝาปิดไม่สนิท หรือยังมีคราบ",
      "หยุดถ้ามีการนำกรด แอมโมเนีย แอลกอฮอล์ หรือน้ำยาชนิดอื่นมาผสมกับ bleach",
    ],
    evidencePrompt: [
      "ถ่ายรูปฉลาก bleach ให้เห็น sodium hypochlorite และความเข้มข้น",
      "ถ่ายรูปภาชนะ ฝา ถาด และตัวจับเวลาหลังคว่ำครบ 10 นาที ไม่ต้องถ่ายต้นไม้",
      "บันทึกอัตราส่วน 5 mL ต่อปริมาตรสุดท้าย 100 mL ปริมาตรที่เตรียม และรหัสภาชนะ",
    ],
    readyChecklist: [
      "ภาชนะและฝาทุกชิ้นผ่านการตรวจสภาพและล้างคราบแล้ว",
      "สารละลายสัมผัสด้านใน ขอบปาก และฝาครบ",
      "คว่ำบนถาดที่ผ่านสารครบ 10 นาทีและติดรหัสแล้ว",
    ],
    nextActionOnPass: "แบ่งอาหารลงภาชนะที่เตรียมแล้ว ปิดฝา ติด batch และตั้ง Blank",
    nextActionOnFail: "แยกภาชนะที่ไม่ผ่าน ล้างและเริ่มขั้นฆ่าเชื้อภาชนะใหม่ ห้ามแบ่งอาหารลงภาชนะนั้น",
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
      "เตาให้ความร้อน ภาชนะทนความร้อน และแท่งแก้วคน",
      "เทอร์โมมิเตอร์ช่วงที่อ่าน 55–60°C ได้",
      "ถุงมือกันความร้อน",
      "Haiter ที่อ่านฉลากแล้ว",
      "ภาชนะเพาะ ฝา ป้าย batch และปากกา",
      "ถุงมือและแว่นตา",
    ],
    actions: [
      "เปิดสูตรของ Protocol version นี้และเลือกปริมาตร batch ที่จะทำ",
      "ชั่ง MS, sucrose และ agar ตามตาราง แล้วเติม stock hormone ตามปริมาตรที่คำนวณไว้",
      "เติมน้ำเกือบครบปริมาตร คนให้ละลาย แล้วปรับ pH ตามช่วงที่สูตรระบุ",
      "ปรับปริมาตรสุดท้าย เทลงภาชนะทนความร้อน แล้วให้ความร้อนระดับต่ำถึงปานกลางพร้อมคนต่อเนื่องจนไม่เห็นเม็ดหรือก้อน agar",
      "ปิดคลุมอย่างหลวมเพื่อกันฝุ่น ใช้เทอร์โมมิเตอร์วัด และรอให้อาหารลดลงถึง 55–60°C ก่อนเติม Haiter ตามปริมาตรที่ระบบคำนวณ ห้ามเดาด้วยหยด",
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
  if (id === "prepare-pressure-vessels") return {
    ...shared,
    objective: "ตรวจ ล้าง และจัดภาชนะกับฝาให้พร้อมฆ่าเชื้อพร้อมอาหารในหม้อนึ่ง",
    materials: [
      "ภาชนะและฝาที่ผู้ผลิตระบุว่าทน 121°C และแรงดัน",
      "น้ำยาล้างภาชนะ น้ำสะอาด และน้ำกลั่น/น้ำ deionized",
      "ป้ายหรือเทปทนความร้อน",
      "คู่มือภาชนะและคู่มือหม้อนึ่ง",
    ],
    actions: [
      "อ่านสัญลักษณ์หรือเอกสารผู้ผลิต ยืนยันว่าภาชนะและฝาทน 121°C และแรงดัน ห้ามเดาจากรูปลักษณ์",
      "ทิ้งภาชนะที่แตก บิ่น บิดงอ ฝาปิดไม่สนิท หรือไม่มีข้อมูลว่าทนความร้อนและแรงดัน",
      "ล้างภาชนะและฝาด้วยน้ำยาล้างภาชนะ ล้างน้ำจนไม่มีฟอง แล้วล้างรอบสุดท้ายด้วยน้ำกลั่นหรือน้ำ deionized",
      "ติดรหัสด้วยป้ายทนความร้อนและกันอย่างน้อยหนึ่งใบเป็น Blank control",
      "ยังไม่ถือว่าภาชนะปลอดเชื้อในขั้นนี้ ภาชนะจะถูกฆ่าเชื้อพร้อมอาหารในขั้นหม้อนึ่ง",
    ],
    whatToFind: [
      "มีข้อมูลยืนยันว่าภาชนะและฝาทน 121°C และแรงดัน",
      "ไม่มีคราบ รอยแตก รอยบิ่น หรือฝาที่เสียรูป",
      "ทุกใบมีรหัสทนความร้อนและมี Blank control",
    ],
    stopConditions: [
      "หยุดถ้าไม่มีข้อมูลความทนความร้อน/แรงดัน",
      "หยุดถ้าภาชนะเสียหาย มีคราบ หรือฝาปิดไม่สนิท",
    ],
    evidencePrompt: [
      "ถ่ายรูปสัญลักษณ์หรือเอกสารที่ยืนยันความทน 121°C/แรงดัน",
      "ถ่ายรูปภาชนะ ฝา และรหัสก่อนบรรจุอาหาร ไม่ต้องถ่ายต้นไม้",
    ],
    readyChecklist: [
      "ตรวจข้อมูลวัสดุและสภาพภาชนะครบทุกใบ",
      "ล้างคราบและติดรหัสทนความร้อนแล้ว",
      "แยก Blank control แล้ว",
    ],
    nextActionOnPass: "บรรจุอาหารลงภาชนะ แล้วฆ่าเชื้อภาชนะ ฝา และอาหารพร้อมกันในรอบหม้อนึ่ง",
    nextActionOnFail: "เปลี่ยนภาชนะหรือฝาให้ตรงข้อกำหนดแล้วเริ่มตรวจใหม่",
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
      "เตาให้ความร้อน ภาชนะทนความร้อน แท่งแก้วคน และถุงมือกันความร้อน",
      "เทอร์โมมิเตอร์ช่วงที่อ่าน 55–60°C ได้",
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
      {
        ...profileStep(
          "sanitize-haiter-vessels",
          "ฆ่าเชื้อภาชนะเพาะและฝาแบบ Haiter",
          "ล้าง ตรวจสภาพ และให้สารละลาย sodium hypochlorite สัมผัสด้านใน ขอบปาก และฝาตามคู่มือ ก่อนแบ่งอาหาร",
          "Experimental",
        ),
        referenceIds: ["source-csup-2012", "source-naocl-vessels-2009"],
        requiredEvidence: ["note", "photo"],
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
      "เตาให้ความร้อน ภาชนะทนความร้อน และแท่งแก้วคน",
      "ถุงมือกันความร้อน แว่นตานิรภัย และพื้นที่วางภาชนะร้อน",
    ],
    blankPolicy: "recommended-skippable",
    steps: [
      {
        ...profileStep(
          "prepare-pressure-vessels",
          "ตรวจและเตรียมภาชนะเพาะสำหรับหม้อนึ่ง",
          "ยืนยันว่าภาชนะและฝาทน 121°C/แรงดัน ล้างคราบ ติดรหัส และเตรียม Blank ก่อนบรรจุอาหาร",
          "Adapted",
        ),
        referenceIds: ["source-merck-media-sterilization"],
        requiredEvidence: ["note", "photo"],
      },
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

export function workspaceStepForSetup(
  baseStep: ProtocolStep,
  setup?: WorkspaceSetupSnapshot,
): ProtocolStep {
  if (!setup) return {
    ...baseStep,
    title: "เลือกและเตรียมพื้นที่ทำงานปลอดเชื้อ",
    instruction: "Lot นี้ยังไม่มีข้อมูล SAB/ตู้ลมและสารเช็ดพื้นผิว กรุณาสร้าง Lot ใหม่ผ่าน Wizard ก่อนเริ่มงาน",
    evidenceState: "Experimental",
    requiredEvidence: ["note"],
    beginner: createBeginnerInstruction({
      currentAction: "หยุดและบันทึกข้อมูลพื้นที่ทำงาน",
      actions: ["สร้าง Lot ใหม่ผ่าน Wizard แล้วเลือก Still-Air Box หรือ laminar-flow cabinet พร้อมสารที่ใช้เช็ดพื้นผิว"],
      materials: ["แบบบันทึก"],
      doNotDoYet: ["อย่าเปิดอาหาร อย่าตัดต้น และอย่าฉีดสารใดในพื้นที่ที่ยังไม่ได้เลือกวิธี"],
      whatToFind: ["Lot ใหม่มีชื่อพื้นที่ทำงาน สารเช็ดพื้นผิว และอุปกรณ์ที่มีจริง"],
      stopConditions: ["ไม่มีข้อมูลพื้นที่ทำงานหรือฉลากสาร"],
      evidencePrompt: ["บันทึกว่า Lot นี้เป็น legacy และยังไม่มี workspace profile"],
      readyChecklist: ["สร้าง Lot ใหม่ที่มี workspace profile แล้ว"],
      scienceNote: "การเตรียมพื้นที่ต้องผูกกับอุปกรณ์และสารที่มีจริง ไม่ใช้คำแนะนำแบบเดา",
    }),
  };

  const workspaceName = setup.workspaceType === "still-air-box"
    ? "Still-Air Box (SAB)"
    : "ตู้ลมสะอาด/laminar-flow cabinet";
  const custom = setup.customEquipment.filter(Boolean);
  const sharedMaterials = [
    workspaceName,
    "น้ำยาล้างพื้นผิวหรือสบู่กับน้ำสำหรับกำจัดคราบ",
    "ผ้าเช็ดแบบใช้ครั้งเดียวหรือกระดาษไม่เป็นขุย",
    "ถุงมือและแว่นตานิรภัย",
    "ตัวจับเวลา",
    ...custom,
  ];
  const sharedActions = [
    `วาง ${workspaceName} บนโต๊ะมั่นคงในห้องที่ไม่มีลมโกรก ปิดพัดลมและหลีกเลี่ยงการเดินผ่าน`,
    "นำของออกจากพื้นที่ แล้วล้างคราบที่มองเห็นด้วยสบู่/น้ำก่อน เพราะสารฆ่าเชื้อทำงานได้ไม่ดีบนคราบ",
  ];
  const finishActions = setup.workspaceType === "still-air-box"
    ? [
        "เช็ดด้านในจากส่วนบนลงด้านล่าง: เพดาน ด้านข้าง ด้านหลัง พื้น และขอบช่องสอดแขน โดยใช้ด้านสะอาดของผ้าแต่ละช่วง",
        "เช็ดด้านนอกของอุปกรณ์ทุกชิ้นก่อนนำเข้า จัดของให้หยิบได้โดยไม่ไขว้มือเหนือภาชนะเปิด",
        "ปิด SAB และรอให้อากาศนิ่งอย่างน้อย 15 นาทีหลังการเคลื่อนย้ายของครั้งสุดท้าย",
        "ก่อนสอดมือ ให้ทำความสะอาดถุงมือด้านนอกด้วยวิธีเดียวกันและรอให้แห้ง ห้ามแตะโทรศัพท์ ลูกบิด หรือของนอก SAB แล้วกลับเข้าไปทำงาน",
      ]
    : [
        "เปิดตู้และรอเวลาตามคู่มือผู้ผลิตก่อนเริ่ม ห้ามเดาเวลาการ purge ของ HEPA",
        "เช็ดพื้นผิวทำงานโดยไม่ฉีดสารเข้าตะแกรงหรือแผ่นกรอง HEPA",
        "จัดของไม่บังช่องลม และทำงานจากของสะอาดไปของที่ใช้แล้ว",
      ];

  const alcoholActions = [
    ...sharedActions,
    `อ่านฉลากยืนยันว่า alcohol อยู่ในช่วง 70–90%; Lot นี้บันทึก ${setup.alcoholPercent ?? "ไม่ระบุ"}%`,
    setup.applicator === "spray-to-wipe"
      ? "นำขวดออกนอก SAB หันหัวฉีดเข้าหาผ้าและฉีดให้ผ้าชื้น ห้ามพ่นเป็นละอองในอากาศหรือพ่นเข้าหาใบหน้า"
      : "เท alcohol ลงบนผ้าให้ชื้นนอก SAB ห้ามเทหรือฉีดจนเกิดแอ่งภายในกล่อง",
    "เช็ดให้พื้นผิวเปียกทั่วตามเวลาสัมผัสบนฉลาก แล้วรอจนแห้งสนิทและกลิ่นไอลดลงก่อนนำของเข้า",
    ...finishActions,
  ];
  const haiterActions = [
    ...sharedActions,
    `อ่านผลคำนวณสำหรับพื้นผิว: Haiter จากฉลาก ${setup.haiterSourcePercent ?? "ไม่ระบุ"}% → เป้าหมาย ${setup.haiterTargetPercent ?? "ไม่ระบุ"}% ปริมาตรรวม ${setup.solutionVolumeMl ?? "ไม่ระบุ"} mL`,
    `ตวง Haiter ${setup.calculatedHaiterMl ?? "ยังไม่คำนวณ"} mL แล้วเติมน้ำอุณหภูมิห้องให้ครบ ${setup.solutionVolumeMl ?? "ปริมาตรที่ระบุ"} mL ห้ามผสมกับ alcohol หรือสารทำความสะอาดอื่น`,
    setup.applicator === "spray-to-wipe"
      ? "เตรียมสารในที่ระบายอากาศ หันหัวฉีดเข้าหาผ้าแล้วฉีดให้ชื้น ห้ามพ่นละอองใน SAB"
      : "เทสารที่เจือจางแล้วลงบนผ้าให้ชื้นในที่ระบายอากาศ",
    "เช็ดให้พื้นผิวเปียกทั่วและคงความเปียกตาม contact time บนฉลาก หากฉลากไม่ระบุเวลา ห้ามเดาและห้ามเริ่มงาน",
    "รอให้พื้นผิวแห้งและระบายอากาศจนไม่มีกลิ่นฉุนก่อนปิดเพื่อให้อากาศนิ่ง ห้ามเช็ดทับด้วย alcohol ใน session เดียวกัน",
    ...finishActions,
  ];
  const actions = setup.disinfectant === "alcohol-70" ? alcoholActions : haiterActions;
  const disinfectantName = setup.disinfectant === "alcohol-70"
    ? `alcohol ${setup.alcoholPercent ?? "ไม่ระบุ"}%`
    : "Haiter ตามค่าจากฉลาก";

  return {
    ...baseStep,
    title: `เตรียม ${workspaceName} ด้วย ${disinfectantName}`,
    instruction: actions.join(" "),
    evidenceState: "Experimental",
    referenceIds: Array.from(new Set([
      ...baseStep.referenceIds,
      "source-cdc-bleach-safety",
      "source-who-alcohol-bleach",
    ])),
    materials: sharedMaterials,
    criticalControls: [
      "ห้ามผสม Haiter/bleach กับ alcohol กรด แอมโมเนีย หรือสารทำความสะอาดอื่น",
      "ห้ามใช้เปลวไฟ ความร้อน หรือประกายไฟในหรือใกล้ SAB โดยเฉพาะเมื่อใช้ alcohol",
      "ห้ามพ่นละอองเข้าหา HEPA หรือพ่นฟุ้งในพื้นที่ปิด",
    ],
    safetyNotes: [
      "เตรียมสารในพื้นที่ระบายอากาศ สวมถุงมือและแว่นตา",
      "ถ้ามีกลิ่นฉุนผิดปกติ แสบตา ไอ หรือหายใจลำบาก ให้ออกจากพื้นที่ไปสู่อากาศบริสุทธิ์และทำตามฉลาก/ข้อมูลฉุกเฉินของผลิตภัณฑ์",
    ],
    expectedResult: `${workspaceName} ไม่มีคราบ พื้นผิวผ่าน contact time แห้งแล้ว อุปกรณ์จัดแยกสะอาด/ใช้แล้ว และไม่มีไอสารสะสม`,
    passCriteria: [
      "มีรูปพื้นที่ก่อนและหลังเช็ด",
      "บันทึกชื่อสาร ความเข้มข้น contact time และเวลาที่เริ่มทำงาน",
      "พื้นผิวแห้ง ไม่มีแอ่งสาร และไม่มีเปลวไฟ/แหล่งประกาย",
    ],
    failCriteria: [
      "ไม่ทราบความเข้มข้นหรือ contact time จากฉลาก",
      "มีการใช้ Haiter กับ alcohol ในพื้นที่เดียวกันโดยยังไม่ได้ล้าง/ระบายอากาศ",
      "ยังมีคราบ แอ่งสาร กลิ่นฉุน หรือลมรบกวนพื้นที่",
    ],
    nextActionOnPass: "ตรวจรายการอาหาร ภาชนะ เครื่องมือ และ Blank ก่อนเปิดขั้นตัด",
    nextActionOnFail: "หยุดงาน ปิดอาหารไว้ แก้รายการที่ไม่ผ่าน แล้วเริ่มการเตรียมพื้นที่ใหม่ตั้งแต่ต้น",
    requiredEvidence: ["note", "photo"],
    allowPhoto: true,
    beginner: createBeginnerInstruction({
      currentAction: `เตรียม ${workspaceName}`,
      actions,
      materials: sharedMaterials,
      doNotDoYet: [
        "อย่าเปิดอาหารหรือเริ่มตัดต้นจนกว่าพื้นผิวแห้งและตรวจครบ",
        "ห้ามผสม Haiter กับ alcohol หรือฉีดทับกัน",
        "ห้ามจุดไฟใน SAB",
      ],
      whatToFind: [
        "ไม่มีคราบหรือหยดสารค้าง",
        "อุปกรณ์สะอาดอยู่ด้านหนึ่ง ของใช้แล้วมีพื้นที่แยก",
        setup.workspaceType === "still-air-box" ? "อากาศในกล่องนิ่งหลังรออย่างน้อย 15 นาที" : "ตู้ทำงานครบเวลาตามคู่มือและช่องลมไม่ถูกบัง",
      ],
      stopConditions: [
        "ฉลากไม่มีความเข้มข้นหรือ contact time",
        "ยังมีกลิ่นฉุน แสบตา ไอ หรือหายใจไม่สะดวก",
        "มีเปลวไฟ ประกายไฟ พัดลม หรือลมเป่าเข้าพื้นที่",
      ],
      evidencePrompt: [
        "ถ่ายรูปพื้นที่ว่างก่อนเช็ด",
        "ถ่ายฉลากสารให้เห็นชื่อ ความเข้มข้น และ contact time",
        "ถ่ายรูปการจัดอุปกรณ์หลังพื้นผิวแห้ง ไม่ต้องถ่ายต้นไม้",
      ],
      readyChecklist: [
        "ฉันใช้สารเพียงชนิดเดียวและไม่ได้ผสมหรือฉีดทับสารอื่น",
        "ฉันทำครบ contact time และรอให้พื้นผิวแห้ง",
        "ฉันจัดอุปกรณ์และรอให้อากาศนิ่ง/ตู้ purge ครบแล้ว",
      ],
      scienceNote: "การล้างกำจัดคราบ ส่วนสารฆ่าเชื้อต้องสัมผัสพื้นผิวตามเวลาบนฉลาก; alcohol ติดไฟง่ายและ bleach ห้ามผสมกับสารทำความสะอาดอื่น",
    }),
  };
}

export function composeGuidedSteps(
  baseSteps: ProtocolStep[],
  profile: SterilizationProfile,
  workspaceSetup?: WorkspaceSetupSnapshot,
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
  const workspace = beforeCut
    .filter((step) => step.workflowPhase === "medium-preparation")
    .map((step) => workspaceStepForSetup(step, workspaceSetup));
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
