import { toWeightPerVolumePercent } from "@/lib/domain/haiter-calculations";
import type { ChemicalPreparationSnapshot } from "@/lib/domain/models";

/** อัตราตั้งต้นของโปรโตคอล haiter-medium-v1 หน่วย mL ของน้ำยาฟอกต่ออาหาร 1 ลิตร */
export const MEDIUM_HAITER_ML_PER_L = 2;

/** ฉลากบอกได้ทั้ง w/v และ w/w และไม่เท่ากัน ต้องแปลงเป็น w/v ก่อนเข้าสูตรทุกครั้ง
 *  เดิมจุดนี้คูณ 20 กับเลขบนฉลากตรง ๆ ทำให้ Haiter 6% w/w ได้เป้าหมาย 120 ppm
 *  ทั้งที่ค่าจริงคือ 129.6 ppm (ต่ำกว่าที่ตั้งใจ 7.4%) ซึ่งขัดกับที่ระบบบังคับไว้ทุกที่อื่น */
export function mediumHaiterTargetPpmFor(
  labelConcentration: number | undefined,
  labelBasis: ChemicalPreparationSnapshot["labelBasis"],
): number {
  const label = labelConcentration && labelConcentration > 0 ? labelConcentration : 6;
  const basis = labelBasis === "w/w" ? "w/w" : "w/v";
  const weightPerVolume = toWeightPerVolumePercent(label, basis);
  return Math.round(weightPerVolume * MEDIUM_HAITER_ML_PER_L * 10 * 100) / 100;
}
