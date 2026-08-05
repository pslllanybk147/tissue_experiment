import type { MediaRecipe, StepOverride } from "../types";
import type { Dose } from "../forms/types";

/** แผ่นเสริมระดับสกุล เก็บเฉพาะส่วนที่ต่างจากทรง ไม่ใช่คู่มือทั้งเล่ม
 *  ชั้นนี้ทำงานหนักที่สุดในเชิงความครอบคลุม เพราะโปรโตคอลเกาะกลุ่มตามสกุลมากกว่าตามชนิด
 *
 *  ความเสี่ยงที่ต้องระวัง คือการเอาผลจากชนิดเดียวมาวางที่ชั้นสกุลแล้วปล่อยให้ไหลลง
 *  ไปหาทุกชนิดในสกุล ซึ่งดูน่าเชื่อถือเกินจริง เทสต์จึงบังคับว่าค่าระดับ adapted
 *  ต้องเขียน note บอกว่ายืมมาจากชนิดไหน */
export type GenusPack = {
  id: string;
  growthFormId: string;
  scientificName: string;
  commonNames: string[];
  deviations: Record<string, StepOverride>;
  /** ทับค่าเชิงปริมาณของทรงด้วยคีย์เดียวกับ GrowthForm.defaultDoses */
  doses?: Record<string, Dose>;
  mediaRecipes?: MediaRecipe[];
  sourceIds: string[];
};
