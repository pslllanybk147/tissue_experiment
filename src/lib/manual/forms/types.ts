import type { EvidenceRef, MeasurementUnit, StepOverride } from "../types";

/** จุดสังเกตบนต้นที่มือใหม่ต้องหาให้เจอ — คือคำศัพท์ที่ชี้ตำแหน่งได้จริง
 *  ทะเบียนคำศัพท์ของทั้งระบบมาจากที่นี่ที่เดียว ไม่มีคลังคำแยกต่างหาก */
export type Landmark = {
  id: string;
  term: string;
  /** คำที่คนพูดจริงแต่ไม่ใช่ชื่อทางการ ใช้ให้ค้นเจอ */
  aka?: string[];
  /** ห้ามใช้ศัพท์เทคนิคอื่นซ้อนในคำอธิบายนี้ ไม่งั้นมือใหม่จะวนหาความหมายไม่จบ */
  whatItIs: string;
  howToFind: string;
  confusedWith?: string;
  /** พิกัด 0–1 บนภาพอ้างอิงของทรง มีได้เมื่อทรงนั้นมี referenceImageId เท่านั้น */
  point?: { x: number; y: number };
  evidence: EvidenceRef;
};

/** หมุดบนภาพต้นจริงของสายพันธุ์ แยกจาก Landmark.point ซึ่งอยู่บนภาพอ้างอิงของทรง */
export type CutMarker = {
  imageId: string;
  landmarkId: string;
  point: { x: number; y: number };
  label: string;
  evidence: EvidenceRef;
};

/** ค่าเชิงปริมาณที่ต้องแสดงเป็นช่วง เพราะตัวแปรที่ขยับมันแรงที่สุดคือที่มาของต้นแม่
 *  และลักษณะเนื้อเยื่อ ไม่ใช่ชนิดพืช การแสดงตัวเลขเดี่ยวจึงแม่นเกินความจริง */
export type Dose = {
  /** ชื่อและรูปแบบที่ใช้จริง เช่น "น้ำยาซักผ้าขาว NaOCl 6%" ไม่ใช่ชื่อสารลอย ๆ */
  form: string;
  low: number;
  high: number;
  unit: MeasurementUnit;
  durationMin: [number, number];
  movesLowerWhen: string[];
  movesHigherWhen: string[];
  evidence: EvidenceRef;
  /** ทางเลือกวิธี/สารที่ dose นี้ใช้ ถ้ามีค่า BracketNotice จะโชว์ปุ่มเปิดเครื่องคำนวณที่ตรงกันต่อท้าย
   *  ไม่มีค่า = ไม่โชว์ปุ่ม เหมือนพฤติกรรมเดิมของ dose ทุกตัวก่อนหน้านี้ */
  method?: "haiter" | "nadcc";
};

/** ภาพอ้างอิงของทรง เป็นภาพต้นจริงของชนิดหนึ่งที่เป็นตัวแทน ไม่ใช่ภาพของทุกชนิดในทรง
 *  ไฟล์ commit ขึ้น public repo จึงต้องพกเครดิตและใบอนุญาตติดตัวมาด้วยเสมอ */
export type FormImage = {
  /** ชื่อไฟล์ใน public/forms/ เช่น "climbing-vine-visible-node.jpg" */
  file: string;
  /** ชนิดที่อยู่ในภาพจริง ๆ ต้องบอกผู้ใช้ตรง ๆ ตามกฎชั้น D ของ newplant_protocol.md */
  speciesShown: string;
  credit: string;
  license: "CC BY-SA 4.0";
  /** ต้องบรรยายโครงสร้างที่เห็น ไม่ใช่ "ภาพต้นไม้" */
  alt: string;
  /** ใช้กันหน้ากระตุกตอนโหลด และใช้คำนวณภาพซูมใน crop.ts */
  width: number;
  height: number;
};

export type GrowthForm = {
  id: string;
  label: string;
  /** ให้คนที่ไม่รู้อะไรเลยจำแนกต้นของตัวเองได้ */
  plainDescription: string;
  referenceImage?: FormImage;
  landmarks: Landmark[];
  defaultExplant: {
    landmarkId: string;
    offsetMm: number;
    direction: "above" | "below";
    sizeMm: [number, number];
    /** เป็นข้ออ้าง ไม่ใช่คำนิยาม จึงต้องมีที่มาและเข้ากฎจุดอ่อนที่สุด */
    evidence: EvidenceRef;
  };
  beginnerDifficulty: 1 | 2 | 3;
  /** เหตุผลจริง ไม่ใช่ดาวลอย ๆ แสดงที่หน้า /start */
  whyThisDifficulty: string;
  /** ทับค่าขั้นจากแกนกลางในระดับทรง เช่น ขั้น select-explant ของทรงเถาเลื้อย */
  stepOverrides?: Record<string, StepOverride>;
  /** ค่าเชิงปริมาณระดับทรง คีย์เป็นชื่อค่าที่ trait อ้างถึงได้ เช่น "sterilize.dose"
   *  ชั้นสกุลทับค่าตรงนี้ได้ด้วยคีย์เดียวกัน */
  defaultDoses?: Record<string, Dose>;
  /** เมื่อมีค่านี้ แปลว่าทรงนี้ไม่มี "จุดตัดที่ถูกต้อง" แบบทรงอื่น เพราะพืชกลุ่มนี้ไม่มีข้อหรือลำต้นจริง
   *  (เช่นมอส) ทุกจุดของเนื้อเยื่อต้นทางที่ยังสดสามารถแตกยอดใหม่ได้เท่า ๆ กัน landmark ของทรงนี้จึงเป็น
   *  แค่คำนิยามโครงสร้างเพื่อให้ผู้ใช้จำต้นตัวเองได้ ไม่ใช่ตำแหน่งตัดที่ต้องเล็ง defaultExplant ยังต้องมี
   *  ไว้ตามชนิดของระบบเดิม แต่ที่นี่หมายถึง "ขนาดชิ้นที่ควรตัด" ไม่ใช่ "ตำแหน่งเทียบ landmark"
   *  หน้า /start ใช้ field นี้เพื่อเปลี่ยนคำอธิบายจาก "หาจุดตัดให้เจอ" เป็น "ตัดชิ้นขนาดนี้จากตรงไหนก็ได้" */
  fragmentPropagation?: {
    note: string;
    fragmentSizeMm: [number, number];
    sourceTissueNote: string;
    evidence: EvidenceRef;
  };
};
