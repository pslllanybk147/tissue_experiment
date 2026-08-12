import type { MediaRecipe } from "@/lib/manual/types";
import { formatVolume } from "@/lib/domain/working-stock-calculator";
import { planMediumBatch, type IngredientLine, type MediumPlan, type ToolLimits } from "./medium-plan";

export type MediumExecutionContext = {
  recipe: MediaRecipe;
  plan: MediumPlan;
  mlPerJar: number;
};

export type MediumInstructionOverride = {
  action: string;
  quantity: string;
  completion?: string;
  next?: string;
};

/** สร้าง snapshot เดียวกับค่าตั้งต้นของเครื่องคำนวณ เพื่อให้การ์ดขั้นตอนมีตัวเลขตั้งแต่ render แรก */
export function defaultMediumExecutionContext(
  recipes: MediaRecipe[],
  initialRecipeId?: string,
  tools?: Partial<ToolLimits>,
): MediumExecutionContext | null {
  const recipe = (initialRecipeId ? recipes.find((item) => item.id === initialRecipeId) : undefined) ?? recipes[0];
  if (!recipe) return null;
  const resolvedTools: ToolLimits = {
    scaleMinimumMg: tools?.scaleMinimumMg ?? 10,
    pipetteMinimumMl: tools?.pipetteMinimumMl ?? 0.2,
    msLabelRateGPerL: tools?.msLabelRateGPerL ?? 4.43,
    bcdLabelRateGPerL: tools?.bcdLabelRateGPerL ?? 0,
    naaStockMgPerMl: tools?.naaStockMgPerMl ?? 0,
    baStockMgPerMl: tools?.baStockMgPerMl ?? 0,
    bapStockMgPerMl: tools?.bapStockMgPerMl ?? 0,
    ibaStockMgPerMl: tools?.ibaStockMgPerMl ?? 0,
  };
  try {
    return {
      recipe,
      plan: planMediumBatch(recipe, { cultureJars: 4, blankJars: 1, spareJars: 1, mlPerJar: 25, lossPercent: 15 }, resolvedTools),
      mlPerJar: 25,
    };
  } catch {
    return null;
  }
}

function amount(value: number, unit: string): string {
  const digits = unit === "g" ? 3 : 2;
  const scale = 10 ** digits;
  const rounded = Math.round((value + Number.EPSILON) * scale) / scale;
  return `${rounded} ${unit}`;
}

function lineText(line: IngredientLine): string {
  if (line.kind === "weigh" || line.kind === "measure") return `${line.name} ${amount(line.amount, line.unit)}`;
  if (line.kind === "needs-label-rate") return `${line.name}: ${line.message}`;
  if (line.plan.state === "blocked") return `${line.name}: ${line.plan.reason}`;
  if (line.plan.state === "direct") return `${line.name}: ตวง stock เดิม ${formatVolume(line.plan.directDoseMl)} mL`;
  return `${line.name}: เตรียม working stock โดยใช้ stock เดิม ${formatVolume(line.plan.sourceVolumeMl)} mL + ตัวทำละลาย ${formatVolume(line.plan.diluentVolumeMl)} mL แล้วตวง working stock ${formatVolume(line.plan.workingDoseMl)} mL`;
}

function isAgar(line: IngredientLine): boolean {
  return line.name.toLowerCase().includes("agar") || line.name.includes("วุ้น");
}

export function mediumInstructionOverride(label: string, context: MediumExecutionContext): MediumInstructionOverride {
  const { plan, recipe } = context;
  const agar = plan.lines.find(isAgar);
  const main = plan.lines.filter((line) => !isAgar(line) && line.kind !== "working-stock");
  const stocks = plan.lines.filter((line) => line.kind === "working-stock");
  const mainText = main.length > 0 ? main.map(lineText).join(" · ") : "ไม่มีส่วนผสมหลักที่ต้องชั่งในสูตรนี้";
  const stockText = stocks.length > 0 ? stocks.map(lineText).join(" · ") : "สูตรนี้ไม่มีน้ำยาแม่ฮอร์โมน";
  const agarText = agar ? lineText(agar) : "สูตรนี้ไม่มี Agar";

  if (label === "เลือกสูตรและคำนวณ batch") {
    return {
      action: `เลือกสูตร ${recipe.title} แล้วทำอาหารทั้งหมด ${plan.totalVolumeMl} mL ตามค่าด้านล่าง`,
      quantity: `${recipe.title} · ${plan.totalVolumeMl} mL · ${plan.totalJars} กระปุก × ${context.mlPerJar} mL + เผื่อสูญเสีย`,
      completion: `เครื่องคำนวณแสดง ${plan.totalVolumeMl} mL และปริมาณส่วนผสมของสูตร ${recipe.title} แล้ว`,
    };
  }
  if (label === "ละลายส่วนผสมหลัก") {
    return {
      action: `ตวงน้ำตั้งต้น ${plan.initialWaterMl} mL (ประมาณ ${plan.initialWaterPercent}% ของปริมาตรสุดท้าย ${plan.finalVolumeMl} mL) แล้วค่อย ๆ ละลาย ${mainText} ให้ใสก่อนเติมส่วนผสมถัดไป`,
      quantity: mainText,
    };
  }
  if (label === "เติมน้ำยาแม่") {
    return {
      action: stocks.length > 0
        ? `เตรียมและเติมน้ำยาแม่ตามปริมาณจริงนี้: ${stockText}`
        : `สูตรนี้ไม่มีน้ำยาแม่ฮอร์โมน ให้ข้ามข้อนี้ไป`,
      quantity: stockText,
    };
  }
  if (label === "ปรับ pH") {
    return {
      action: `วัด pH ของสารละลาย แล้วใช้ pH up/down ทีละน้อยจนได้ pH ${recipe.pH}`,
      quantity: `${recipe.title}: pH ${recipe.pH}`,
      completion: `ค่า pH อยู่ที่ ${recipe.pH} ก่อนใส่วุ้น`,
      next: "เมื่อ pH ถึงเป้าหมายแล้วจึงใส่ผงวุ้น",
    };
  }
  if (label === "เติมผงวุ้น") {
    return {
      action: `หลัง pH ถึงเป้าหมายแล้ว ชั่ง ${agarText} เติมลงในสารละลาย แล้วคนให้ผงวุ้นเปียกทั่วก่อนให้ความร้อน`,
      quantity: agarText,
      completion: "ผงวุ้นเปียกทั่วสารละลายและไม่ลอยจับเป็นก้อน ก่อนเข้าสู่ขั้นให้ความร้อน",
    };
  }
  if (label === "ให้ความร้อนจนวุ้นละลาย") {
    return {
      action: "ให้ความร้อนและคนเป็นระยะจนวุ้นละลายหมด สารละลายไม่เห็นเม็ดวุ้นหรือก้อนวุ้น แล้วปิดความร้อน",
      quantity: agarText,
      completion: "วุ้นละลายหมด ไม่มีเม็ดหรือก้อนวุ้นให้เห็น และสารละลายพร้อมเติมน้ำให้ครบปริมาตร",
      next: "เติมน้ำให้ครบปริมาตรสุดท้ายก่อนแบ่งลงกระปุก",
    };
  }
  if (label === "เติมน้ำให้ครบปริมาตรสุดท้าย") {
    return {
      action: `เติมน้ำทีละน้อยจนได้ปริมาตรสุดท้าย ${plan.finalVolumeMl} mL หลังรวมส่วนผสมทุกตัวแล้ว ห้ามเติมน้ำเต็ม ${plan.finalVolumeMl} mL ตั้งแต่ต้น`,
      quantity: `ปริมาตรสุดท้าย ${plan.finalVolumeMl} mL · น้ำตั้งต้น ${plan.initialWaterMl} mL`,
      completion: `สารละลายมีปริมาตรรวม ${plan.finalVolumeMl} mL และพร้อมแบ่งลงกระปุก`,
      next: "แบ่งอาหารลงกระปุกตามปริมาตรต่อกระปุก",
    };
  }
  if (label === "แบ่งและติดป้าย") {
    // เดิมเขียนว่า "แบ่งอาหารทั้งหมด 173 mL ลง 6 กระปุก กระปุกละ 25 mL" ซึ่งขัดกันเองในประโยคเดียว
    // (6 × 25 = 150 ไม่ใช่ 173) ส่วนต่างคือเผื่อสูญเสียที่ตั้งใจให้เหลือ ต้องบอกให้ชัดว่าเหลือแล้วทำยังไง
    const poured = plan.totalJars * context.mlPerJar;
    const leftover = Math.round((plan.totalVolumeMl - poured) * 10) / 10;
    const leftoverText = leftover > 0
      ? ` อาหารที่เหลืออีกประมาณ ${leftover} mL คือส่วนเผื่อสูญเสีย ไม่ต้องฝืนแบ่งลงกระปุกให้หมด`
      : "";
    const blankText = plan.blankJars > 0
      ? ` ในจำนวนนี้มีกระปุกเปล่าคุม ${plan.blankJars} ใบ เขียนป้ายว่า “กระปุกเปล่าคุม” ให้ชัดและห้ามใส่ชิ้นพืชลงไป เพราะใช้ตรวจว่าอาหารกับภาชนะปลอดเชื้อจริงหรือไม่`
      : "";
    return {
      action: `แบ่งอาหารลง ${plan.totalJars} กระปุก กระปุกละ ${context.mlPerJar} mL (ใช้อาหาร ${poured} mL)`
        + `${leftoverText} แล้วติดป้ายทุกใบพร้อมวันที่และรหัสรอบ${blankText}`,
      quantity: `${plan.totalJars} กระปุก · ${context.mlPerJar} mL ต่อกระปุก · ใช้อาหาร ${poured} mL จากที่ทำไว้ ${plan.totalVolumeMl} mL`
        + (plan.blankJars > 0
          ? ` · แยกเป็นกระปุกใส่ชิ้นพืช ${plan.cultureJars} ใบ, กระปุกเปล่าคุม ${plan.blankJars} ใบ, สำรอง ${plan.spareJars} ใบ`
          : ""),
      completion: `${plan.totalJars} กระปุกมีอาหารกระปุกละ ${context.mlPerJar} mL ติดป้ายครบ`
        + (plan.blankJars > 0 ? ` และแยกกระปุกเปล่าคุม ${plan.blankJars} ใบไว้ต่างหากแล้ว` : ""),
      next: "ฆ่าเชื้อกระปุกที่แบ่งไว้ตามวิธีที่ล็อกกับรอบนี้ ก่อนนำไปใช้",
    };
  }
  return { action: "", quantity: "" };
}
