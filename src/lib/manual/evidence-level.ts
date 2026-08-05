import type { EvidenceLevel, ResolvedManual } from "./types";

/** อันดับความแข็งของหลักฐาน ใช้หาค่าต่ำสุด
 *  botanical-fact ไม่อยู่ในตารางนี้เพราะมันไม่ใช่ข้ออ้าง จึงถูกกรองทิ้งก่อนถึงขั้นเทียบ */
const rank: Record<"unsupported" | "adapted" | "species-direct", number> = {
  unsupported: 0,
  adapted: 1,
  "species-direct": 2,
};

function isClaim(level: EvidenceLevel): level is keyof typeof rank {
  return level !== "botanical-fact";
}

/** ระดับหลักฐานของคู่มือทั้งเล่ม เท่ากับข้ออ้างที่อ่อนที่สุดในเล่ม
 *
 *  เหตุผลที่นับเฉพาะข้ออ้าง คือกฎนี้มีไว้เตือนความเสี่ยงที่ต้องลงมือทำแล้วรอผล
 *  ส่วนคำนิยาม (botanical-fact) ตรวจได้จากตำราก่อนลงมือ ถ้านับรวมเข้าไปด้วย
 *  ทุกคู่มือจะถูกลากลงเท่ากันหมดและป้ายจะแยกเล่มไม่ออกอีกต่อไป
 *
 *  คืน null เมื่อไม่มีข้ออ้างเลย ซึ่งแปลว่ายังตัดสินไม่ได้ ไม่ใช่ว่าดีหรือแย่ */
export function manualEvidenceLevel(manual: ResolvedManual): EvidenceLevel | null {
  const levels: Array<keyof typeof rank> = [];
  for (const step of manual.steps) if (isClaim(step.evidence.level)) levels.push(step.evidence.level);
  for (const recipe of manual.mediaRecipes) if (isClaim(recipe.evidence.level)) levels.push(recipe.evidence.level);

  if (levels.length === 0) return null;
  return levels.reduce((weakest, level) => (rank[level] < rank[weakest] ? level : weakest));
}
